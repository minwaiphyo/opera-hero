import type {
  VisionHand,
  VisionLandmark,
  VisionLandmarkFrame,
} from "../../../vision/visionTypes";
import {
  OPENING_DOOR_MAXIMUM_HAND_WRIST_DISTANCE,
  extractOpeningDoorFrameFeatures,
  type OpeningDoorArmFeatures,
} from "./openingDoorFeatures";
import {
  angleOf,
  distance,
  jointAngle,
  normalizedOffset,
  type Vector2,
} from "./geometry";

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;
const HAND_WRIST = 0;
const MIDDLE_MCP = 9;
const FINGERS = {
  thumb: { mcp: 2, pip: 3, dip: 3, tip: 4 },
  index: { mcp: 5, pip: 6, dip: 7, tip: 8 },
  middle: { mcp: 9, pip: 10, dip: 11, tip: 12 },
  ring: { mcp: 13, pip: 14, dip: 15, tip: 16 },
  pinky: { mcp: 17, pip: 18, dip: 19, tip: 20 },
} as const;

export type OrchidFingerName = keyof typeof FINGERS;
export type OrchidFingerArmFeatures = OpeningDoorArmFeatures;

export interface OrchidFingerHandFeatures {
  palmCenterFromBody: Vector2;
  palmDirectionRad: number;
  fingerExtension: Record<OrchidFingerName, number>;
  fingerCurlRad: Record<Exclude<OrchidFingerName, "thumb">, number>;
  thumbToFingertip: Record<Exclude<OrchidFingerName, "thumb">, number>;
  confidence: number;
}

export interface OrchidFingerFrameFeatures {
  capturedAtMs: number;
  shoulderWidth: number;
  leftArm: OrchidFingerArmFeatures | null;
  rightArm: OrchidFingerArmFeatures | null;
  leftHand: OrchidFingerHandFeatures | null;
  rightHand: OrchidFingerHandFeatures | null;
  usableArmCount: number;
  usableHandCount: number;
}

export function extractOrchidFingerFrameFeatures(
  frame: Pick<VisionLandmarkFrame, "capturedAtMs" | "pose" | "hands">,
): OrchidFingerFrameFeatures | null {
  const armFeatures = extractOpeningDoorFrameFeatures(frame);
  const landmarks = frame.pose?.landmarks;
  if (!armFeatures || !landmarks) return null;
  const leftShoulder = landmarks[LEFT_SHOULDER]!;
  const rightShoulder = landmarks[RIGHT_SHOULDER]!;
  const bodyCenter = midpoint(leftShoulder, rightShoulder);
  const assigned = assignHands(
    frame.hands,
    landmarks[LEFT_WRIST],
    landmarks[RIGHT_WRIST],
    armFeatures.shoulderWidth,
  );
  const leftHand = extractHand(assigned.left, bodyCenter, armFeatures.shoulderWidth);
  const rightHand = extractHand(assigned.right, bodyCenter, armFeatures.shoulderWidth);
  return {
    capturedAtMs: frame.capturedAtMs,
    shoulderWidth: armFeatures.shoulderWidth,
    leftArm: armFeatures.leftArm,
    rightArm: armFeatures.rightArm,
    leftHand,
    rightHand,
    usableArmCount: armFeatures.usableArmCount,
    usableHandCount: Number(leftHand !== null) + Number(rightHand !== null),
  };
}

function extractHand(
  hand: VisionHand | null,
  bodyCenter: VisionLandmark,
  shoulderWidth: number,
): OrchidFingerHandFeatures | null {
  if (!hand || hand.landmarks.length < 21) return null;
  const wrist = hand.landmarks[HAND_WRIST]!;
  const middleMcp = hand.landmarks[MIDDLE_MCP]!;
  const palmLength = distance(wrist, middleMcp);
  if (palmLength <= Number.EPSILON) return null;
  const fingerExtension = Object.fromEntries(
    Object.entries(FINGERS).map(([name, indices]) => [
      name,
      distance(wrist, hand.landmarks[indices.tip]!) / palmLength,
    ]),
  ) as Record<OrchidFingerName, number>;
  const fingerCurlRad = Object.fromEntries(
    (["index", "middle", "ring", "pinky"] as const).map((name) => {
      const indices = FINGERS[name];
      return [
        name,
        jointAngle(
          hand.landmarks[indices.mcp]!,
          hand.landmarks[indices.pip]!,
          hand.landmarks[indices.dip]!,
        ) ?? 0,
      ];
    }),
  ) as OrchidFingerHandFeatures["fingerCurlRad"];
  const thumbTip = hand.landmarks[FINGERS.thumb.tip]!;
  const thumbToFingertip = Object.fromEntries(
    (["index", "middle", "ring", "pinky"] as const).map((name) => [
      name,
      distance(thumbTip, hand.landmarks[FINGERS[name].tip]!) / palmLength,
    ]),
  ) as OrchidFingerHandFeatures["thumbToFingertip"];
  const palmCenter = average([
    wrist,
    hand.landmarks[5]!,
    middleMcp,
    hand.landmarks[13]!,
    hand.landmarks[17]!,
  ]);
  return {
    palmCenterFromBody: normalizedOffset(bodyCenter, palmCenter, shoulderWidth),
    palmDirectionRad: angleOf(normalizedOffset(wrist, middleMcp, palmLength)),
    fingerExtension,
    fingerCurlRad,
    thumbToFingertip,
    confidence: hand.handednessScore,
  };
}

function assignHands(
  hands: readonly VisionHand[],
  leftWrist: VisionLandmark | undefined,
  rightWrist: VisionLandmark | undefined,
  shoulderWidth: number,
): { left: VisionHand | null; right: VisionHand | null } {
  const candidates = hands.filter((hand) => hand.landmarks.length >= 21).flatMap(
    (hand, handIndex) => [
      ...(visible(leftWrist) ? [{ hand, handIndex, side: "left" as const, cost: distance(hand.landmarks[0]!, leftWrist) }] : []),
      ...(visible(rightWrist) ? [{ hand, handIndex, side: "right" as const, cost: distance(hand.landmarks[0]!, rightWrist) }] : []),
    ],
  ).sort((a, b) => a.cost - b.cost);
  const result: { left: VisionHand | null; right: VisionHand | null } = { left: null, right: null };
  const used = new Set<number>();
  for (const candidate of candidates) {
    if (result[candidate.side] || used.has(candidate.handIndex)) continue;
    if (candidate.cost / shoulderWidth > OPENING_DOOR_MAXIMUM_HAND_WRIST_DISTANCE) continue;
    result[candidate.side] = candidate.hand;
    used.add(candidate.handIndex);
  }
  return result;
}

function visible(landmark: VisionLandmark | undefined): landmark is VisionLandmark {
  return Boolean(landmark && Number.isFinite(landmark.x) && Number.isFinite(landmark.y) && landmark.visibility >= 0.5);
}

function midpoint(a: VisionLandmark, b: VisionLandmark): VisionLandmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: 0, visibility: 1 };
}

function average(points: readonly VisionLandmark[]): VisionLandmark {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    z: 0,
    visibility: 1,
  };
}
