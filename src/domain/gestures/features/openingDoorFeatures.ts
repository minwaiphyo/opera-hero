import type {
  VisionHand,
  VisionLandmark,
  VisionLandmarkFrame,
} from "../../../vision/visionTypes";
import {
  angleOf,
  distance,
  jointAngle,
  normalizedOffset,
  type Vector2,
} from "./geometry";

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_ELBOW = 13;
const RIGHT_ELBOW = 14;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;
const HAND_WRIST = 0;
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const RING_MCP = 13;
const PINKY_MCP = 17;
const FINGERTIPS = [4, 8, 12, 16, 20] as const;

export const OPENING_DOOR_VISIBILITY_THRESHOLD = 0.5;
export const OPENING_DOOR_MINIMUM_SHOULDER_WIDTH = 0.02;
export const OPENING_DOOR_MAXIMUM_HAND_WRIST_DISTANCE = 1.5;

export interface OpeningDoorArmFeatures {
  elbowFromShoulder: Vector2;
  wristFromShoulder: Vector2 | null;
  elbowAngleRad: number | null;
  confidence: number;
}

export interface OpeningDoorHandFeatures {
  palmCenterFromBody: Vector2;
  palmDirectionRad: number;
  openness: number;
  confidence: number;
}

export interface OpeningDoorFrameFeatures {
  capturedAtMs: number;
  shoulderWidth: number;
  leftArm: OpeningDoorArmFeatures | null;
  rightArm: OpeningDoorArmFeatures | null;
  leftHand: OpeningDoorHandFeatures | null;
  rightHand: OpeningDoorHandFeatures | null;
  usableArmCount: number;
  usableHandCount: number;
}

export function extractOpeningDoorFrameFeatures(
  frame: Pick<VisionLandmarkFrame, "capturedAtMs" | "pose" | "hands">,
): OpeningDoorFrameFeatures | null {
  const landmarks = frame.pose?.landmarks;
  if (!landmarks) return null;
  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];
  if (
    !visible(leftShoulder) ||
    !visible(rightShoulder) ||
    distance(leftShoulder, rightShoulder) < OPENING_DOOR_MINIMUM_SHOULDER_WIDTH
  ) return null;

  const shoulderWidth = distance(leftShoulder, rightShoulder);
  const bodyCenter = midpoint(leftShoulder, rightShoulder);
  const leftPoseWrist = landmarks[LEFT_WRIST];
  const rightPoseWrist = landmarks[RIGHT_WRIST];
  const assignedHands = assignHands(
    frame.hands,
    leftPoseWrist,
    rightPoseWrist,
    shoulderWidth,
  );
  const leftArm = extractArm(
    leftShoulder,
    landmarks[LEFT_ELBOW],
    leftPoseWrist,
    shoulderWidth,
  );
  const rightArm = extractArm(
    rightShoulder,
    landmarks[RIGHT_ELBOW],
    rightPoseWrist,
    shoulderWidth,
  );
  const leftHand = extractHand(assignedHands.left, bodyCenter, shoulderWidth);
  const rightHand = extractHand(assignedHands.right, bodyCenter, shoulderWidth);

  return {
    capturedAtMs: frame.capturedAtMs,
    shoulderWidth,
    leftArm,
    rightArm,
    leftHand,
    rightHand,
    usableArmCount: Number(leftArm !== null) + Number(rightArm !== null),
    usableHandCount: Number(leftHand !== null) + Number(rightHand !== null),
  };
}

function extractArm(
  shoulder: VisionLandmark,
  elbow: VisionLandmark | undefined,
  wrist: VisionLandmark | undefined,
  shoulderWidth: number,
): OpeningDoorArmFeatures | null {
  if (!visible(elbow)) return null;
  const wristVisible = visible(wrist);
  return {
    elbowFromShoulder: normalizedOffset(shoulder, elbow, shoulderWidth),
    wristFromShoulder: wristVisible
      ? normalizedOffset(shoulder, wrist, shoulderWidth)
      : null,
    elbowAngleRad: wristVisible ? jointAngle(shoulder, elbow, wrist) : null,
    confidence: Math.min(shoulder.visibility, elbow.visibility),
  };
}

function extractHand(
  hand: VisionHand | null,
  bodyCenter: VisionLandmark,
  shoulderWidth: number,
): OpeningDoorHandFeatures | null {
  if (!hand || hand.landmarks.length < 21) return null;
  const wrist = hand.landmarks[HAND_WRIST]!;
  const middleMcp = hand.landmarks[MIDDLE_MCP]!;
  const palmLength = distance(wrist, middleMcp);
  if (palmLength <= Number.EPSILON) return null;
  const palmCenter = averageLandmarks(
    [HAND_WRIST, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP]
      .map((index) => hand.landmarks[index]!),
  );
  const palmDirection = normalizedOffset(wrist, middleMcp, palmLength);
  const openness = FINGERTIPS.reduce(
    (sum, index) => sum + distance(wrist, hand.landmarks[index]!) / palmLength,
    0,
  ) / FINGERTIPS.length;

  return {
    palmCenterFromBody: normalizedOffset(bodyCenter, palmCenter, shoulderWidth),
    palmDirectionRad: angleOf(palmDirection),
    openness,
    confidence: hand.handednessScore,
  };
}

function assignHands(
  hands: readonly VisionHand[],
  leftWrist: VisionLandmark | undefined,
  rightWrist: VisionLandmark | undefined,
  shoulderWidth: number,
): { left: VisionHand | null; right: VisionHand | null } {
  const usableHands = hands.filter((hand) => hand.landmarks.length >= 21);
  const candidates = usableHands.flatMap((hand, handIndex) => {
    const wrist = hand.landmarks[HAND_WRIST]!;
    return [
      ...(visible(leftWrist)
        ? [{ hand, handIndex, side: "left" as const, cost: distance(wrist, leftWrist) }]
        : []),
      ...(visible(rightWrist)
        ? [{ hand, handIndex, side: "right" as const, cost: distance(wrist, rightWrist) }]
        : []),
    ];
  }).sort((a, b) => a.cost - b.cost);
  const result: { left: VisionHand | null; right: VisionHand | null } = {
    left: null,
    right: null,
  };
  const used = new Set<number>();
  for (const candidate of candidates) {
    if (result[candidate.side] || used.has(candidate.handIndex)) continue;
    if (candidate.cost / shoulderWidth > OPENING_DOOR_MAXIMUM_HAND_WRIST_DISTANCE) continue;
    result[candidate.side] = candidate.hand;
    used.add(candidate.handIndex);
  }
  return result;
}

function midpoint(a: VisionLandmark, b: VisionLandmark): VisionLandmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: 0, visibility: 1 };
}

function averageLandmarks(points: readonly VisionLandmark[]): VisionLandmark {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    z: 0,
    visibility: 1,
  };
}

function visible(
  landmark: VisionLandmark | undefined,
): landmark is VisionLandmark {
  return Boolean(
    landmark &&
    Number.isFinite(landmark.x) &&
    Number.isFinite(landmark.y) &&
    landmark.visibility >= OPENING_DOOR_VISIBILITY_THRESHOLD,
  );
}
