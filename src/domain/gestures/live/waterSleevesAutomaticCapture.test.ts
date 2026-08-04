import { describe, expect, it } from "vitest";
import type { VisionLandmark, VisionLandmarkFrame } from "../../../vision/visionTypes";
import { WaterSleevesAutomaticCapture } from "./waterSleevesAutomaticCapture";

describe("WaterSleevesAutomaticCapture", () => {
  it("counts down, waits through small adjustments, and starts on sustained motion", () => {
    const capture = automaticCapture();
    capture.start("attempt-1", 0);

    expect(capture.advance(2000)).toMatchObject({
      phase: "countdown",
      countdownRemainingMs: 1000,
    });
    expect(capture.push(frame(3000, 0))).toMatchObject({
      phase: "waiting-for-movement",
    });
    capture.push(frame(3100, 0.005));
    capture.push(frame(3200, 0.01));
    expect(capture.getSnapshot(3200).phase).toBe("waiting-for-movement");

    capture.push(frame(3300, 0.08));
    capture.push(frame(3400, 0.16));
    expect(capture.push(frame(3500, 0.24))).toMatchObject({
      phase: "recording",
      attempt: { bufferedSamples: 1 },
    });
  });

  it("finishes after sustained stillness but preserves a short internal pause", () => {
    const capture = automaticCapture();
    startMotion(capture);

    capture.push(frame(3700, 0.4));
    capture.push(frame(3900, 0.4));
    capture.push(frame(4300, 0.4));
    capture.push(frame(4400, 0.55));
    expect(capture.getSnapshot(4400).phase).toBe("recording");

    capture.push(frame(5000, 0.7));
    capture.push(frame(5200, 0.7));
    capture.push(frame(5700, 0.7));
    expect(capture.push(frame(6400, 0.7)).phase).toBe("completed");
    expect(capture.getTrajectory()?.samples.length).toBeGreaterThan(5);
  });

  it("allows cancellation during countdown or recording", () => {
    const capture = automaticCapture();
    capture.start("cancel-countdown", 0);
    capture.cancel();
    expect(capture.getSnapshot(100).phase).toBe("cancelled");

    capture.reset();
    startMotion(capture);
    capture.cancel();
    expect(capture.getSnapshot(4000).phase).toBe("cancelled");
    expect(capture.getTrajectory()).toBeNull();
  });
});

function automaticCapture() {
  return new WaterSleevesAutomaticCapture({
    countdownMs: 3000,
    motionStartThreshold: 0.03,
    motionStartFrames: 3,
    stillnessThreshold: 0.01,
    stillnessDurationMs: 1000,
    minimumRecordingMs: 1200,
  });
}

function startMotion(capture: WaterSleevesAutomaticCapture) {
  capture.start("moving", 0);
  capture.push(frame(3000, 0));
  capture.push(frame(3100, 0.08));
  capture.push(frame(3200, 0.16));
  capture.push(frame(3300, 0.24));
  expect(capture.getSnapshot(3300).phase).toBe("recording");
}

function frame(capturedAtMs: number, armOffset: number): VisionLandmarkFrame {
  const landmarks = Array.from({ length: 33 }, () => point(0, 0));
  landmarks[11] = point(0.4, 0.3);
  landmarks[12] = point(0.6, 0.3);
  landmarks[13] = point(0.3 + armOffset, 0.45);
  landmarks[14] = point(0.7 - armOffset, 0.45);
  landmarks[15] = point(0.25 + armOffset, 0.6);
  landmarks[16] = point(0.75 - armOffset, 0.6);
  return {
    frameId: capturedAtMs,
    capturedAtMs,
    completedAtMs: capturedAtMs + 5,
    pose: { landmarks, worldLandmarks: landmarks },
    hands: [],
    timing: { poseMs: 5, handsMs: 0, totalMs: 5 },
  };
}

function point(x: number, y: number): VisionLandmark {
  return { x, y, z: 0, visibility: 0.95 };
}
