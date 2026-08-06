import { describe, expect, it } from "vitest";
import type { VisionHand, VisionLandmark, VisionLandmarkFrame } from "../../../vision/visionTypes";
import { estimateOrchidFingerMotion } from "./orchidFingerMotion";

describe("estimateOrchidFingerMotion", () => {
  it("ignores pose jitter while tracked hands remain stable", () => {
    expect(estimateOrchidFingerMotion(frame(0, 0, 0), frame(1, 0.1, 0.005))).toBeLessThan(0.08);
  });
  it("detects meaningful hand movement", () => {
    expect(estimateOrchidFingerMotion(frame(0, 0, 0), frame(1, 0, 0.03))).toBeGreaterThan(0.08);
  });
  it("falls back to arm pose motion when hands are unavailable", () => {
    expect(estimateOrchidFingerMotion(frame(0, 0, 0, false), frame(1, 0.1, 0, false))).toBeGreaterThan(0.08);
  });
});

function frame(frameId: number, poseShift: number, handShift: number, hands = true): VisionLandmarkFrame {
  const pose = Array.from({ length: 33 }, () => point(0.5, 0.5));
  pose[11] = point(0.4, 0.3); pose[12] = point(0.6, 0.3);
  for (const index of [13, 14, 15, 16]) pose[index] = point(0.5 + poseShift, 0.5);
  return { frameId, capturedAtMs: frameId, completedAtMs: frameId, pose: { landmarks: pose, worldLandmarks: pose }, hands: hands ? [hand(handShift)] : [], timing: { poseMs: 0, handsMs: 0, totalMs: 0 } };
}
function hand(shift: number): VisionHand {
  const landmarks = Array.from({ length: 21 }, (_, index) => point(0.4 + shift + (index % 4) * 0.01, 0.4 + Math.floor(index / 4) * 0.01));
  landmarks[0] = point(0.4 + shift, 0.5); landmarks[9] = point(0.4 + shift, 0.4);
  return { landmarks, worldLandmarks: landmarks, reportedHandedness: "left", handednessScore: 0.9 };
}
function point(x: number, y: number): VisionLandmark { return { x, y, z: 0, visibility: 0.95 }; }
