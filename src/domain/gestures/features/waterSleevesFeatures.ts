import type {
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

export const WATER_SLEEVES_VISIBILITY_THRESHOLD = 0.5;
export const MINIMUM_SHOULDER_WIDTH = 0.02;

export interface WaterSleevesArmFeatures {
  upperArmAngleRad: number;
  elbowFromShoulder: Vector2;
  elbowAngleRad: number | null;
  wristFromShoulder: Vector2 | null;
  confidence: number;
}

export interface WaterSleevesFrameFeatures {
  capturedAtMs: number;
  shoulderWidth: number;
  leftArm: WaterSleevesArmFeatures | null;
  rightArm: WaterSleevesArmFeatures | null;
  usableArmCount: number;
  /** Hand Landmarker output is deliberately excluded for the sleeved costume. */
  handsUsed: false;
}

export function extractWaterSleevesFrameFeatures(
  frame: Pick<VisionLandmarkFrame, "capturedAtMs" | "pose">,
): WaterSleevesFrameFeatures | null {
  const landmarks = frame.pose?.landmarks;
  if (!landmarks) {
    return null;
  }
  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];
  if (
    !visible(leftShoulder) ||
    !visible(rightShoulder) ||
    distance(leftShoulder, rightShoulder) < MINIMUM_SHOULDER_WIDTH
  ) {
    return null;
  }

  const shoulderWidth = distance(leftShoulder, rightShoulder);
  const leftArm = extractArm(
    leftShoulder,
    landmarks[LEFT_ELBOW],
    landmarks[LEFT_WRIST],
    shoulderWidth,
  );
  const rightArm = extractArm(
    rightShoulder,
    landmarks[RIGHT_ELBOW],
    landmarks[RIGHT_WRIST],
    shoulderWidth,
  );

  return {
    capturedAtMs: frame.capturedAtMs,
    shoulderWidth,
    leftArm,
    rightArm,
    usableArmCount: Number(leftArm !== null) + Number(rightArm !== null),
    handsUsed: false,
  };
}

function extractArm(
  shoulder: VisionLandmark,
  elbow: VisionLandmark | undefined,
  wrist: VisionLandmark | undefined,
  shoulderWidth: number,
): WaterSleevesArmFeatures | null {
  if (!visible(elbow)) {
    return null;
  }
  const elbowOffset = normalizedOffset(shoulder, elbow, shoulderWidth);
  const wristVisible = visible(wrist);
  return {
    upperArmAngleRad: angleOf(elbowOffset),
    elbowFromShoulder: elbowOffset,
    elbowAngleRad: wristVisible ? jointAngle(shoulder, elbow, wrist) : null,
    wristFromShoulder: wristVisible
      ? normalizedOffset(shoulder, wrist, shoulderWidth)
      : null,
    confidence: Math.min(shoulder.visibility, elbow.visibility),
  };
}

function visible(
  landmark: VisionLandmark | undefined,
): landmark is VisionLandmark {
  return (
    landmark !== undefined &&
    Number.isFinite(landmark.x) &&
    Number.isFinite(landmark.y) &&
    landmark.visibility >= WATER_SLEEVES_VISIBILITY_THRESHOLD
  );
}
