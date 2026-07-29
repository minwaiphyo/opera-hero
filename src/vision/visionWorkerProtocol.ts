import type {
  LandmarkFrame,
  VisionCapabilities,
  VisionFrameInput,
  VisionModelProfile,
} from "./landmarkTypes";
import { isLandmarkFrame } from "./landmarkValidation";

export type VisionWorkerRequest =
  | {
      type: "initialize";
      model: Exclude<VisionModelProfile, "simulated">;
      maxHands: number;
    }
  | { type: "process-frame"; frame: VisionFrameInput }
  | { type: "dispose" };

export type VisionWorkerResponse =
  | { type: "ready"; capabilities: VisionCapabilities }
  | { type: "result"; frame: LandmarkFrame }
  | { type: "frame-skipped"; frameId: number; reason: "busy" | "stale" }
  | {
      type: "error";
      code: "initialization-failed" | "inference-failed" | "invalid-message";
      message: string;
    }
  | { type: "disposed" };

export function isVisionWorkerResponse(
  value: unknown,
): value is VisionWorkerResponse {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }

  const response = value as Record<string, unknown>;
  if (response.type === "result") {
    return isLandmarkFrame(response.frame);
  }
  if (response.type === "ready") {
    return isCapabilities(response.capabilities);
  }
  if (response.type === "frame-skipped") {
    return (
      Number.isInteger(response.frameId) &&
      (response.reason === "busy" || response.reason === "stale")
    );
  }
  if (response.type === "error") {
    return (
      ["initialization-failed", "inference-failed", "invalid-message"].includes(
        String(response.code),
      ) && typeof response.message === "string"
    );
  }
  return response.type === "disposed";
}

function isCapabilities(value: unknown): value is VisionCapabilities {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const capabilities = value as Record<string, unknown>;
  return (
    typeof capabilities.adapter === "string" &&
    (capabilities.runtime === "fake" ||
      capabilities.runtime === "mediapipe-worker") &&
    ["lite", "full", "heavy", "simulated"].includes(
      String(capabilities.model),
    ) &&
    Number.isInteger(capabilities.poseLandmarkCount) &&
    Number.isInteger(capabilities.handLandmarkCount) &&
    Number.isInteger(capabilities.maxHands)
  );
}
