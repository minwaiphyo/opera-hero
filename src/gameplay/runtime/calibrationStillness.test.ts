import { describe, expect, it } from "vitest";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import { CALIBRATION_HOLD_MS, CalibrationStillness } from "./calibrationStillness";

describe("calibration stillness", () => {
  it("completes after a sustained stable hold", () => {
    const detector = new CalibrationStillness();
    expect(detector.push(frame(0))).toEqual({
      ready: true,
      progress: 0,
      complete: false,
    });
    expect(hold(detector, CALIBRATION_HOLD_MS / 2).progress).toBeCloseTo(0.5);
    expect(hold(detector, CALIBRATION_HOLD_MS, CALIBRATION_HOLD_MS / 2 + 100).complete).toBe(true);
  });

  it("resets after meaningful sustained movement", () => {
    const detector = new CalibrationStillness();
    detector.push(frame(0));
    detector.push(frame(1_000));
    detector.push(frame(1_100, 0.04));
    expect(detector.push(frame(1_350, 0.08)).progress).toBe(0);
    expect(detector.push(frame(1_450, 0.08)).complete).toBe(false);
  });

  it("tolerates one jitter spike and rejects unusable tracking", () => {
    const detector = new CalibrationStillness();
    hold(detector, 900);
    detector.push(frame(1_000, 0.02));
    let snapshot = detector.push(frame(1_100, 0.02));
    for (let at = 1_200; at <= 2_000; at += 100) snapshot = detector.push(frame(at, 0.02));
    expect(snapshot.complete).toBe(true);

    const missing = frame(2_100);
    missing.pose = undefined;
    expect(detector.push(missing)).toEqual({ ready: false, progress: 0, complete: false });
  });

  it("starts when the upper body is usable even if hip visibility is imperfect", () => {
    const detector = new CalibrationStillness();
    const partial = frame(0);
    partial.pose!.landmarks[23]!.visibility = 0.3;
    partial.pose!.landmarks[24]!.visibility = 0.3;

    expect(detector.push(partial).ready).toBe(true);
  });
});

function hold(
  detector: CalibrationStillness,
  untilMs: number,
  fromMs = 0,
) {
  let snapshot = { ready: false, progress: 0, complete: false };
  for (let at = fromMs; at <= untilMs; at += 100) snapshot = detector.push(frame(at));
  return snapshot;
}

function frame(capturedAtMs: number, shift = 0): VisionLandmarkFrame {
  const landmarks = Array.from({ length: 33 }, (_, index) => ({
    x: 0.3 + index * 0.01 + shift,
    y: 0.25 + index * 0.008,
    z: 0,
    visibility: 0.95,
  }));
  landmarks[11] = { x: 0.35 + shift, y: 0.45, z: 0, visibility: 0.95 };
  landmarks[12] = { x: 0.65 + shift, y: 0.45, z: 0, visibility: 0.95 };
  landmarks[23] = { x: 0.4 + shift, y: 0.72, z: 0, visibility: 0.95 };
  landmarks[24] = { x: 0.6 + shift, y: 0.72, z: 0, visibility: 0.95 };
  return {
    frameId: capturedAtMs,
    capturedAtMs,
    completedAtMs: capturedAtMs,
    pose: { landmarks, worldLandmarks: landmarks },
    hands: [],
    timing: { poseMs: 1, handsMs: 1, totalMs: 2 },
  };
}
