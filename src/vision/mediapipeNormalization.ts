import type {
  HandLandmarkerResult,
  Landmark,
  NormalizedLandmark,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import {
  HAND_LANDMARK_COUNT,
  POSE_LANDMARK_COUNT,
  type ReportedHandedness,
  type VisionHand,
  type VisionLandmark,
  type VisionLandmarkFrame,
  type VisionPose,
  type VisionWorldLandmark,
} from "./visionTypes";

export type MediaPipeFrameInput = {
  frameId: number;
  capturedAtMs: number;
  completedAtMs: number;
  poseResult: PoseLandmarkerResult;
  handResult: HandLandmarkerResult;
  poseInferenceMs: number;
  handInferenceMs: number;
};

export class VisionNormalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VisionNormalizationError";
  }
}

/**
 * Copies MediaPipe-owned results into Opera Hero's stable camera-space contract.
 *
 * Coordinates remain unmirrored here. Mirroring belongs to the display layer,
 * while anatomical handedness will be calibrated separately against pose wrists.
 */
export function normalizeMediaPipeFrame(
  input: MediaPipeFrameInput,
): VisionLandmarkFrame {
  assertFrameMetadata(input);
  const pose = normalizePose(input.poseResult);
  const hands = normalizeHands(input.handResult);

  return {
    frameId: input.frameId,
    capturedAtMs: input.capturedAtMs,
    completedAtMs: input.completedAtMs,
    ...(pose ? { pose } : {}),
    hands,
    timing: {
      poseMs: input.poseInferenceMs,
      handsMs: input.handInferenceMs,
      totalMs: input.completedAtMs - input.capturedAtMs,
    },
  };
}

function normalizePose(result: PoseLandmarkerResult): VisionPose | undefined {
  const landmarks = result.landmarks[0];
  if (!landmarks) {
    return undefined;
  }

  assertLandmarkCount("pose", landmarks, POSE_LANDMARK_COUNT);
  const worldLandmarks = result.worldLandmarks[0] ?? [];
  assertLandmarkCount("pose world", worldLandmarks, POSE_LANDMARK_COUNT);

  return {
    landmarks: landmarks.map(copyNormalizedLandmark),
    worldLandmarks: worldLandmarks.map(copyWorldLandmark),
  };
}

function normalizeHands(result: HandLandmarkerResult): VisionHand[] {
  return result.landmarks.map((landmarks, index) => {
    assertLandmarkCount(`hand ${index}`, landmarks, HAND_LANDMARK_COUNT);
    const worldLandmarks = result.worldLandmarks[index] ?? [];
    assertLandmarkCount(
      `hand ${index} world`,
      worldLandmarks,
      HAND_LANDMARK_COUNT,
    );
    const category = result.handedness[index]?.[0];

    return {
      landmarks: landmarks.map(copyNormalizedLandmark),
      worldLandmarks: worldLandmarks.map(copyWorldLandmark),
      reportedHandedness: normalizeHandedness(category?.categoryName),
      handednessScore: probability(category?.score),
    };
  });
}

function copyNormalizedLandmark(landmark: NormalizedLandmark): VisionLandmark {
  return {
    x: finiteNumber(landmark.x),
    y: finiteNumber(landmark.y),
    z: finiteNumber(landmark.z),
    visibility: probability(landmark.visibility),
  };
}

function copyWorldLandmark(landmark: Landmark): VisionWorldLandmark {
  return {
    x: finiteNumber(landmark.x),
    y: finiteNumber(landmark.y),
    z: finiteNumber(landmark.z),
    visibility: probability(landmark.visibility),
  };
}

function normalizeHandedness(value: string | undefined): ReportedHandedness {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "left" || normalized === "right") {
    return normalized;
  }
  return "unknown";
}

function assertLandmarkCount(
  label: string,
  landmarks: readonly unknown[],
  expected: number,
): void {
  if (landmarks.length !== expected) {
    throw new VisionNormalizationError(
      `Expected ${expected} ${label} landmarks, received ${landmarks.length}.`,
    );
  }
}

function assertFrameMetadata(input: MediaPipeFrameInput): void {
  const values = [
    input.frameId,
    input.capturedAtMs,
    input.completedAtMs,
    input.poseInferenceMs,
    input.handInferenceMs,
  ];
  if (
    !Number.isInteger(input.frameId) ||
    input.frameId < 0 ||
    values.some((value) => !Number.isFinite(value)) ||
    input.completedAtMs < input.capturedAtMs ||
    input.poseInferenceMs < 0 ||
    input.handInferenceMs < 0
  ) {
    throw new VisionNormalizationError("Invalid vision frame metadata.");
  }
}

function finiteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function probability(value: number | undefined): number {
  return Math.min(1, Math.max(0, finiteNumber(value ?? 0)));
}
