import type {
  LandmarkFrame,
  NormalizedHand,
  NormalizedLandmark,
  NormalizedPose,
} from "./landmarkTypes";

export const POSE_LANDMARK_COUNT = 33;
export const HAND_LANDMARK_COUNT = 21;

export function isNormalizedLandmark(
  value: unknown,
): value is NormalizedLandmark {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isFiniteNumber(value.x) &&
    value.x >= 0 &&
    value.x <= 1 &&
    isFiniteNumber(value.y) &&
    value.y >= 0 &&
    value.y <= 1 &&
    isFiniteNumber(value.z) &&
    isOptionalProbability(value.visibility) &&
    isOptionalProbability(value.presence)
  );
}

export function isNormalizedPose(value: unknown): value is NormalizedPose {
  return (
    isRecord(value) &&
    Array.isArray(value.landmarks) &&
    value.landmarks.length === POSE_LANDMARK_COUNT &&
    value.landmarks.every(isNormalizedLandmark)
  );
}

export function isNormalizedHand(value: unknown): value is NormalizedHand {
  return (
    isRecord(value) &&
    ["left", "right", "unknown"].includes(String(value.handedness)) &&
    isProbability(value.score) &&
    Array.isArray(value.landmarks) &&
    value.landmarks.length === HAND_LANDMARK_COUNT &&
    value.landmarks.every(isNormalizedLandmark)
  );
}

export function isLandmarkFrame(value: unknown): value is LandmarkFrame {
  return (
    isRecord(value) &&
    Number.isInteger(value.frameId) &&
    isFiniteNumber(value.timestampMs) &&
    (value.pose === undefined || isNormalizedPose(value.pose)) &&
    Array.isArray(value.hands) &&
    value.hands.every(isNormalizedHand) &&
    isProbability(value.trackingQuality) &&
    ["absent", "too-close", "too-far", "partial", "good"].includes(
      String(value.framing),
    ) &&
    isFiniteNumber(value.inferenceDurationMs) &&
    value.inferenceDurationMs >= 0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isProbability(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 1;
}

function isOptionalProbability(value: unknown): boolean {
  return value === undefined || isProbability(value);
}
