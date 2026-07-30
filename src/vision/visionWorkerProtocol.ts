import {
  HAND_LANDMARK_COUNT,
  POSE_LANDMARK_COUNT,
  type VisionHand,
  type VisionLandmark,
  type VisionLandmarkFrame,
  type VisionPose,
  type VisionWorldLandmark,
} from "./visionTypes";

export type VisionDelegate = "GPU" | "CPU";
export type PoseModelVariant = "lite" | "full";

export interface VisionWorkerConfiguration {
  wasmBasePath: string;
  poseModelPath: string;
  handModelPath: string;
  poseModel: PoseModelVariant;
  maxHands: number;
  preferredDelegate: VisionDelegate;
}

export type VisionWorkerRequest =
  | {
      type: "initialize";
      configuration: VisionWorkerConfiguration;
    }
  | {
      type: "process-frame";
      frameId: number;
      capturedAtMs: number;
      bitmap: ImageBitmap;
    }
  | {
      type: "dispose";
    };

export type VisionWorkerErrorCode =
  | "initialization-failed"
  | "inference-failed"
  | "invalid-message"
  | "disposed";

export type VisionWorkerResponse =
  | {
      type: "ready";
      delegate: VisionDelegate;
      poseModel: PoseModelVariant;
      maxHands: number;
    }
  | {
      type: "result";
      frame: VisionLandmarkFrame;
    }
  | {
      type: "error";
      code: VisionWorkerErrorCode;
      frameId?: number;
      message: string;
    }
  | {
      type: "disposed";
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isLandmark = (value: unknown): value is VisionLandmark =>
  isRecord(value) &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y) &&
  isFiniteNumber(value.z) &&
  (value.visibility === undefined || isFiniteNumber(value.visibility));

const isWorldLandmark = (value: unknown): value is VisionWorldLandmark =>
  isRecord(value) &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y) &&
  isFiniteNumber(value.z) &&
  (value.visibility === undefined || isFiniteNumber(value.visibility));

const isPose = (value: unknown): value is VisionPose =>
  isRecord(value) &&
  Array.isArray(value.landmarks) &&
  value.landmarks.length === POSE_LANDMARK_COUNT &&
  value.landmarks.every(isLandmark) &&
  Array.isArray(value.worldLandmarks) &&
  value.worldLandmarks.length === POSE_LANDMARK_COUNT &&
  value.worldLandmarks.every(isWorldLandmark);

const isHand = (value: unknown): value is VisionHand =>
  isRecord(value) &&
  (value.reportedHandedness === "left" ||
    value.reportedHandedness === "right" ||
    value.reportedHandedness === "unknown") &&
  isFiniteNumber(value.handednessScore) &&
  Array.isArray(value.landmarks) &&
  value.landmarks.length === HAND_LANDMARK_COUNT &&
  value.landmarks.every(isLandmark) &&
  Array.isArray(value.worldLandmarks) &&
  value.worldLandmarks.length === HAND_LANDMARK_COUNT &&
  value.worldLandmarks.every(isWorldLandmark);

export const isVisionLandmarkFrame = (
  value: unknown,
): value is VisionLandmarkFrame =>
  isRecord(value) &&
  Number.isInteger(value.frameId) &&
  (value.frameId as number) >= 0 &&
  isFiniteNumber(value.capturedAtMs) &&
  isFiniteNumber(value.completedAtMs) &&
  (value.pose === undefined || isPose(value.pose)) &&
  Array.isArray(value.hands) &&
  value.hands.every(isHand) &&
  isRecord(value.timing) &&
  isFiniteNumber(value.timing.poseMs) &&
  isFiniteNumber(value.timing.handsMs) &&
  isFiniteNumber(value.timing.totalMs);

const errorCodes: ReadonlySet<VisionWorkerErrorCode> = new Set([
  "initialization-failed",
  "inference-failed",
  "invalid-message",
  "disposed",
]);

export const isVisionWorkerResponse = (
  value: unknown,
): value is VisionWorkerResponse => {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  switch (value.type) {
    case "ready":
      return (
        (value.delegate === "GPU" || value.delegate === "CPU") &&
        (value.poseModel === "lite" || value.poseModel === "full") &&
        Number.isInteger(value.maxHands) &&
        (value.maxHands as number) > 0
      );
    case "result":
      return isVisionLandmarkFrame(value.frame);
    case "error":
      return (
        typeof value.code === "string" &&
        errorCodes.has(value.code as VisionWorkerErrorCode) &&
        (value.frameId === undefined ||
          (Number.isInteger(value.frameId) &&
            (value.frameId as number) >= 0)) &&
        typeof value.message === "string"
      );
    case "disposed":
      return true;
    default:
      return false;
  }
};
