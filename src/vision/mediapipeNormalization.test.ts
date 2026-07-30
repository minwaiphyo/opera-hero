import { describe, expect, it } from "vitest";
import type {
  Category,
  HandLandmarkerResult,
  Landmark,
  NormalizedLandmark,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import {
  normalizeMediaPipeFrame,
  VisionNormalizationError,
} from "./mediapipeNormalization";

describe("normalizeMediaPipeFrame", () => {
  it("copies pose, hands, handedness, and timing into the domain contract", () => {
    const poseLandmarks = normalizedLandmarks(33);
    const leftHand = normalizedLandmarks(21);
    const rightHand = normalizedLandmarks(21);
    const frame = normalizeMediaPipeFrame({
      frameId: 9,
      capturedAtMs: 100,
      completedAtMs: 142,
      poseInferenceMs: 18,
      handInferenceMs: 22,
      poseResult: poseResult([poseLandmarks]),
      handResult: handResult(
        [leftHand, rightHand],
        [category("Left", 0.91), category("RIGHT", 1.4)],
      ),
    });

    expect(frame).toMatchObject({
      frameId: 9,
      capturedAtMs: 100,
      completedAtMs: 142,
      timing: { poseMs: 18, handsMs: 22, totalMs: 42 },
      pose: { landmarks: expect.any(Array), worldLandmarks: expect.any(Array) },
      hands: [
        { reportedHandedness: "left", handednessScore: 0.91 },
        { reportedHandedness: "right", handednessScore: 1 },
      ],
    });
    expect(frame.pose?.landmarks).toHaveLength(33);
    expect(frame.hands[0].landmarks).toHaveLength(21);
    expect(frame.pose?.landmarks).not.toBe(poseLandmarks);
    expect(frame.hands[0].landmarks).not.toBe(leftHand);
  });

  it("represents an absent pose and unknown handedness safely", () => {
    const frame = normalizeMediaPipeFrame({
      frameId: 0,
      capturedAtMs: 50,
      completedAtMs: 55,
      poseInferenceMs: 2,
      handInferenceMs: 3,
      poseResult: poseResult([]),
      handResult: handResult([normalizedLandmarks(21)], []),
    });

    expect(frame.pose).toBeUndefined();
    expect(frame.hands[0]).toMatchObject({
      reportedHandedness: "unknown",
      handednessScore: 0,
    });
  });

  it("rejects malformed landmark counts and frame metadata", () => {
    expect(() =>
      normalizeMediaPipeFrame({
        frameId: 1,
        capturedAtMs: 0,
        completedAtMs: 10,
        poseInferenceMs: 4,
        handInferenceMs: 6,
        poseResult: poseResult([normalizedLandmarks(32)]),
        handResult: handResult([], []),
      }),
    ).toThrow(VisionNormalizationError);

    expect(() =>
      normalizeMediaPipeFrame({
        frameId: -1,
        capturedAtMs: 20,
        completedAtMs: 10,
        poseInferenceMs: 0,
        handInferenceMs: 0,
        poseResult: poseResult([]),
        handResult: handResult([], []),
      }),
    ).toThrow("Invalid vision frame metadata");
  });

  it("sanitizes non-finite coordinates and confidence values", () => {
    const landmarks = normalizedLandmarks(33);
    landmarks[0] = {
      x: Number.NaN,
      y: Number.POSITIVE_INFINITY,
      z: Number.NEGATIVE_INFINITY,
      visibility: -2,
    };
    const frame = normalizeMediaPipeFrame({
      frameId: 1,
      capturedAtMs: 0,
      completedAtMs: 1,
      poseInferenceMs: 0.4,
      handInferenceMs: 0.5,
      poseResult: poseResult([landmarks]),
      handResult: handResult([], []),
    });

    expect(frame.pose?.landmarks[0]).toEqual({
      x: 0,
      y: 0,
      z: 0,
      visibility: 0,
    });
  });
});

function normalizedLandmarks(count: number): NormalizedLandmark[] {
  return Array.from({ length: count }, (_, index) => ({
    x: index / Math.max(1, count),
    y: 0.5,
    z: -0.1,
    visibility: 0.9,
  }));
}

function worldLandmarks(count: number): Landmark[] {
  return Array.from({ length: count }, (_, index) => ({
    x: index / 100,
    y: 0.1,
    z: -0.2,
    visibility: 0.8,
  }));
}

function category(categoryName: string, score: number): Category[] {
  return [{ categoryName, score, index: 0, displayName: categoryName }];
}

function poseResult(
  landmarks: NormalizedLandmark[][],
): PoseLandmarkerResult {
  return {
    landmarks,
    worldLandmarks: landmarks.map((entry) => worldLandmarks(entry.length)),
  } as PoseLandmarkerResult;
}

function handResult(
  landmarks: NormalizedLandmark[][],
  handedness: Category[][],
): HandLandmarkerResult {
  return {
    landmarks,
    worldLandmarks: landmarks.map((entry) => worldLandmarks(entry.length)),
    handedness,
    handednesses: handedness,
  };
}
