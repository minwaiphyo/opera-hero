import { describe, expect, it } from "vitest";
import type {
  VisionLandmark,
  VisionLandmarkFrame,
} from "../../../vision/visionTypes";
import { WaterSleevesAttemptBuffer } from "./waterSleevesAttemptBuffer";

describe("WaterSleevesAttemptBuffer", () => {
  it("waits for usable pose tracking before retaining feature samples", () => {
    const buffer = new WaterSleevesAttemptBuffer();
    buffer.start("attempt-1", 0);

    expect(buffer.push(frame(100, false))).toMatchObject({
      tracking: "awaiting",
      bufferedSamples: 0,
    });
    buffer.push(frame(200));
    buffer.push(frame(300));
    const trajectory = buffer.finish(350)!;

    expect(trajectory.samples).toHaveLength(2);
    expect(trajectory.samples.map((sample) => sample.progress)).toEqual([0, 1]);
    expect(trajectory.fixtureId).toBe("live-attempt-1");
    expect(trajectory.samples[0]).not.toHaveProperty("pose");
    expect(trajectory.samples[0]).not.toHaveProperty("hands");
  });

  it("preserves internal tracking gaps and recovers after the grace period", () => {
    const buffer = new WaterSleevesAttemptBuffer({ trackingLossGraceMs: 400 });
    buffer.start("attempt-2", 0);
    buffer.push(frame(100));

    expect(buffer.push(frame(300, false)).tracking).toBe("grace");
    expect(buffer.push(frame(600, false)).tracking).toBe("lost");
    expect(buffer.push(frame(700)).tracking).toBe("tracked");
    const trajectory = buffer.finish(750)!;

    expect(trajectory.samples).toHaveLength(4);
    expect(trajectory.samples[1]).toMatchObject({
      leftArm: null,
      rightArm: null,
    });
    expect(trajectory.usableFrames).toBe(2);
  });

  it("times out at the maximum duration without retaining an extra frame", () => {
    const buffer = new WaterSleevesAttemptBuffer({ maximumDurationMs: 1000 });
    buffer.start("attempt-3", 0);
    buffer.push(frame(100));
    buffer.push(frame(500));

    const snapshot = buffer.push(frame(1000));

    expect(snapshot.status).toBe("timed-out");
    expect(snapshot.bufferedSamples).toBe(2);
    expect(buffer.getTrajectory()?.samples).toHaveLength(2);
  });

  it("bounds memory by finalizing at the maximum sample count", () => {
    const buffer = new WaterSleevesAttemptBuffer({ maximumSamples: 3 });
    buffer.start("attempt-4", 0);

    buffer.push(frame(100));
    buffer.push(frame(200));
    const snapshot = buffer.push(frame(300));
    buffer.push(frame(400));

    expect(snapshot.status).toBe("timed-out");
    expect(buffer.getSnapshot().bufferedSamples).toBe(3);
  });

  it("supports cancellation and clean reuse", () => {
    const buffer = new WaterSleevesAttemptBuffer();
    buffer.start("cancelled", 0);
    buffer.push(frame(100));
    buffer.cancel();

    expect(buffer.getSnapshot()).toMatchObject({
      status: "cancelled",
      bufferedSamples: 0,
    });
    expect(buffer.getTrajectory()).toBeNull();

    buffer.reset();
    buffer.start("next", 1000);
    expect(buffer.getSnapshot()).toMatchObject({
      attemptId: "next",
      status: "recording",
      bufferedSamples: 0,
    });
  });

  it("rejects concurrent attempts and non-monotonic frames", () => {
    const buffer = new WaterSleevesAttemptBuffer();
    buffer.start("attempt-5", 0);

    expect(() => buffer.start("other", 0)).toThrow("already recording");
    buffer.push(frame(100));
    expect(() => buffer.push(frame(100))).toThrow("increase monotonically");
    expect(() => buffer.finish(50)).toThrow("cannot precede");
  });

  it("validates configuration boundaries", () => {
    expect(
      () => new WaterSleevesAttemptBuffer({ maximumSamples: 0 }),
    ).toThrow("maximumSamples");
    expect(
      () => new WaterSleevesAttemptBuffer({ trackingLossGraceMs: -1 }),
    ).toThrow("trackingLossGraceMs");
  });
});

function frame(capturedAtMs: number, usable = true): VisionLandmarkFrame {
  const visibility = usable ? 0.9 : 0.1;
  const landmarks = Array.from({ length: 33 }, () => point(0, 0, 0));
  landmarks[11] = point(0.4, 0.3, visibility);
  landmarks[12] = point(0.6, 0.3, visibility);
  landmarks[13] = point(0.3, 0.45, visibility);
  landmarks[14] = point(0.7, 0.45, visibility);
  landmarks[15] = point(0.25, 0.6, visibility);
  landmarks[16] = point(0.75, 0.6, visibility);
  return {
    frameId: capturedAtMs,
    capturedAtMs,
    completedAtMs: capturedAtMs + 10,
    pose: { landmarks, worldLandmarks: landmarks },
    hands: [],
    timing: { poseMs: 5, handsMs: 0, totalMs: 5 },
  };
}

function point(x: number, y: number, visibility = 0.9): VisionLandmark {
  return { x, y, z: 0, visibility };
}
