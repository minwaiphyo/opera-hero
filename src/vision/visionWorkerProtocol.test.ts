import { describe, expect, it } from "vitest";
import {
  isVisionLandmarkFrame,
  isVisionWorkerResponse,
} from "./visionWorkerProtocol";
import {
  HAND_LANDMARK_COUNT,
  POSE_LANDMARK_COUNT,
  type VisionLandmarkFrame,
} from "./visionTypes";

const landmark = { x: 0.25, y: 0.5, z: -0.1, visibility: 0.9 };

const validFrame: VisionLandmarkFrame = {
  frameId: 4,
  capturedAtMs: 100,
  completedAtMs: 112,
  pose: {
    landmarks: Array.from({ length: POSE_LANDMARK_COUNT }, () => landmark),
    worldLandmarks: Array.from(
      { length: POSE_LANDMARK_COUNT },
      () => landmark,
    ),
  },
  hands: [
    {
      reportedHandedness: "right",
      handednessScore: 0.98,
      landmarks: Array.from({ length: HAND_LANDMARK_COUNT }, () => landmark),
      worldLandmarks: Array.from(
        { length: HAND_LANDMARK_COUNT },
        () => landmark,
      ),
    },
  ],
  timing: {
    poseMs: 7,
    handsMs: 5,
    totalMs: 12,
  },
};

describe("vision worker protocol guards", () => {
  it("accepts a structurally valid landmark frame and result", () => {
    expect(isVisionLandmarkFrame(validFrame)).toBe(true);
    expect(
      isVisionWorkerResponse({ type: "result", frame: validFrame }),
    ).toBe(true);
  });

  it("rejects malformed landmark counts", () => {
    const malformed = {
      ...validFrame,
      pose: {
        ...validFrame.pose,
        landmarks: [landmark],
      },
    };

    expect(isVisionLandmarkFrame(malformed)).toBe(false);
  });

  it("accepts ready, safe error, and disposed responses", () => {
    expect(
      isVisionWorkerResponse({
        type: "ready",
        delegate: "GPU",
        poseModel: "lite",
        maxHands: 2,
        runtimeVersion: "1.0.0",
      }),
    ).toBe(true);
    expect(
      isVisionWorkerResponse({
        type: "error",
        code: "inference-failed",
        frameId: 3,
        message: "Inference could not complete.",
      }),
    ).toBe(true);
    expect(isVisionWorkerResponse({ type: "disposed" })).toBe(true);
  });

  it("rejects unknown messages and unsafe error codes", () => {
    expect(isVisionWorkerResponse({ type: "mystery" })).toBe(false);
    expect(
      isVisionWorkerResponse({
        type: "error",
        code: "raw-stack-trace",
        message: "No",
      }),
    ).toBe(false);
  });
});
