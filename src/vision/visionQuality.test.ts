import { describe, expect, it } from "vitest";
import { HAND_LANDMARK_COUNT, POSE_LANDMARK_COUNT } from "./visionTypes";
import type {
  VisionHand,
  VisionLandmark,
  VisionLandmarkFrame,
} from "./visionTypes";
import { assessVisionTracking } from "./visionQuality";

const point = (
  x: number,
  y: number,
  visibility = 0.9,
): VisionLandmark => ({ x, y, z: 0, visibility });

const hand = (): VisionHand => ({
  landmarks: Array.from({ length: HAND_LANDMARK_COUNT }, () =>
    point(0.5, 0.5),
  ),
  worldLandmarks: Array.from({ length: HAND_LANDMARK_COUNT }, () =>
    point(0, 0),
  ),
  reportedHandedness: "unknown",
  handednessScore: 0,
});

function poseFrame(
  scale: number,
  visibility = 0.9,
  hands = 2,
): VisionLandmarkFrame {
  const landmarks = Array.from({ length: POSE_LANDMARK_COUNT }, () =>
    point(0.5, 0.5, visibility),
  );
  landmarks[0] = point(0.5, 0.2, visibility);
  landmarks[11] = point(0.4, 0.35, visibility);
  landmarks[12] = point(0.6, 0.35, visibility);
  landmarks[13] = point(0.35, 0.5, visibility);
  landmarks[14] = point(0.65, 0.5, visibility);
  landmarks[15] = point(0.3, 0.65, visibility);
  landmarks[16] = point(0.7, 0.65, visibility);
  landmarks[23] = point(0.45, 0.2 + scale, visibility);
  landmarks[24] = point(0.55, 0.2 + scale, visibility);

  return {
    frameId: 1,
    capturedAtMs: 0,
    completedAtMs: 20,
    pose: { landmarks, worldLandmarks: landmarks },
    hands: Array.from({ length: hands }, hand),
    timing: { poseMs: 8, handsMs: 10, totalMs: 20 },
  };
}

describe("assessVisionTracking", () => {
  it("reports absent when no pose exists", () => {
    const result = assessVisionTracking({
      frameId: 1,
      capturedAtMs: 0,
      completedAtMs: 10,
      hands: [],
      timing: { poseMs: 4, handsMs: 5, totalMs: 10 },
    });

    expect(result).toMatchObject({
      presence: false,
      framing: "absent",
      score: 0,
      band: "lost",
    });
  });

  it("rejects a pose with insufficient essential visibility", () => {
    expect(assessVisionTracking(poseFrame(0.45, 0.2))).toMatchObject({
      presence: false,
      framing: "absent",
      band: "lost",
    });
  });

  it.each([
    [0.18, "too-far"],
    [0.45, "good"],
    [0.8, "too-close"],
  ] as const)("classifies upper-body scale %s as %s", (scale, framing) => {
    expect(assessVisionTracking(poseFrame(scale)).framing).toBe(framing);
  });

  it("rewards visible pose coverage and both detected hands", () => {
    const complete = assessVisionTracking(poseFrame(0.45, 0.9, 2));
    const noHands = assessVisionTracking(poseFrame(0.45, 0.9, 0));

    expect(complete).toMatchObject({
      presence: true,
      framing: "good",
      band: "good",
      handsDetected: 2,
    });
    expect(complete.score).toBeGreaterThan(noHands.score);
    expect(noHands.band).toBe("fair");
  });

  it("reduces quality when upper-body landmarks leave the safe frame", () => {
    const frame = poseFrame(0.45, 0.9, 2);
    if (!frame.pose) {
      throw new Error("Fixture requires a pose.");
    }
    const landmarks = [...frame.pose.landmarks];
    landmarks[15] = point(-0.1, 0.5);
    landmarks[16] = point(1.1, 0.5);

    const result = assessVisionTracking({
      ...frame,
      pose: { ...frame.pose, landmarks },
    });

    expect(result.inFrameCoverage).toBeLessThan(1);
    expect(result.score).toBeLessThan(
      assessVisionTracking(poseFrame(0.45)).score,
    );
  });
});
