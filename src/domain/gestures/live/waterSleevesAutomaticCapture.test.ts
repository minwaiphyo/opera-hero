import { describe, expect, it } from "vitest";
import type { VisionLandmark, VisionLandmarkFrame } from "../../../vision/visionTypes";
import { WaterSleevesAutomaticCapture } from "./waterSleevesAutomaticCapture";

describe("WaterSleevesAutomaticCapture", () => {
  it("counts down for five seconds and starts recording immediately", () => {
    const capture = new WaterSleevesAutomaticCapture();
    capture.start("timed-start", 0);

    expect(capture.advance(4_999)).toMatchObject({
      phase: "countdown",
      countdownRemainingMs: 1,
    });
    expect(capture.advance(5_000)).toMatchObject({
      phase: "recording",
      attempt: { bufferedSamples: 0 },
    });
    expect(capture.push(frame(5_050, 0))).toMatchObject({
      attempt: { bufferedSamples: 1 },
    });
  });

  it("completes only after the post-movement guard and sustained stillness", () => {
    const capture = new WaterSleevesAutomaticCapture();
    capture.start("production-finish", 0);
    capture.push(frame(5_000, 0));
    capture.push(frame(6_500, 0.5));
    capture.push(frame(6_600, 0.502));

    expect(capture.push(frame(8_500, 0.504)).phase).toBe("recording");
    expect(capture.push(frame(9_500, 0.506)).phase).toBe("completed");
  });

  it("does not mistake the initial ready pose for completed final stillness", () => {
    const capture = new WaterSleevesAutomaticCapture();
    capture.start("stationary-ready-pose", 0);

    capture.push(frame(5_000, 0));
    capture.push(frame(6_500, 0));
    capture.push(frame(8_000, 0));

    expect(capture.getSnapshot(8_000).phase).toBe("recording");
  });

  it("finishes after sustained stillness but preserves a short internal pause", () => {
    const capture = automaticCapture();
    startRecording(capture);

    capture.push(frame(3_700, 0.4));
    capture.push(frame(3_900, 0.4));
    capture.push(frame(4_300, 0.4));
    capture.push(frame(4_400, 0.55));
    expect(capture.getSnapshot(4_400).phase).toBe("recording");

    capture.push(frame(5_000, 0.7));
    capture.push(frame(5_200, 0.7));
    capture.push(frame(5_700, 0.7));
    expect(capture.push(frame(6_400, 0.7)).phase).toBe("completed");
    expect(capture.getTrajectory()?.samples.length).toBeGreaterThan(5);
  });

  it("allows cancellation during countdown or recording", () => {
    const capture = automaticCapture();
    capture.start("cancel-countdown", 0);
    capture.cancel();
    expect(capture.getSnapshot(100).phase).toBe("cancelled");

    capture.reset();
    startRecording(capture);
    capture.cancel();
    expect(capture.getSnapshot(4_000).phase).toBe("cancelled");
    expect(capture.getTrajectory()).toBeNull();
  });

  it("forwards gesture-specific duration and sample limits to the attempt buffer", () => {
    const capture = new WaterSleevesAutomaticCapture({
      countdownMs: 1,
      maximumDurationMs: 20_000,
      maximumSamples: 2,
    });
    capture.start("bounded", 0);
    capture.push(frame(1, 0));
    expect(capture.push(frame(2, 0.1)).phase).toBe("timed-out");
  });

  it("blocks stillness completion until a gesture-specific minimum duration", () => {
    const capture = new WaterSleevesAutomaticCapture({
      countdownMs: 1,
      stillnessThreshold: 0.02,
      stillnessDurationMs: 500,
      minimumPostMovementMs: 0,
      minimumRecordingMs: 5_000,
    });
    capture.start("minimum-duration", 0);
    capture.push(frame(1, 0));
    capture.push(frame(100, 0.5));
    capture.push(frame(1_000, 0.501));
    expect(capture.push(frame(5_000, 0.502)).phase).toBe("recording");
    expect(capture.push(frame(5_001, 0.503)).phase).toBe("completed");
  });
});

function automaticCapture() {
  return new WaterSleevesAutomaticCapture({
    countdownMs: 3_000,
    stillnessThreshold: 0.01,
    stillnessDurationMs: 1_000,
    minimumRecordingMs: 1_200,
    minimumPostMovementMs: 1_000,
  });
}

function startRecording(capture: WaterSleevesAutomaticCapture) {
  capture.start("moving", 0);
  capture.push(frame(3_000, 0));
  expect(capture.getSnapshot(3_000).phase).toBe("recording");
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
