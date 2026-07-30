import { describe, expect, it } from "vitest";
import type { LatestFrameSchedulerStats } from "./latestFrameScheduler";
import type { VisionLandmarkFrame } from "./visionTypes";
import {
  EMPTY_VISION_DIAGNOSTICS,
  VisionDiagnosticsAccumulator,
} from "./visionDiagnostics";

const scheduler = (
  overrides: Partial<LatestFrameSchedulerStats> = {},
): LatestFrameSchedulerStats => ({
  submitted: 0,
  sent: 0,
  replaced: 0,
  rejected: 0,
  inFlight: false,
  pending: false,
  ...overrides,
});

const frame = (
  frameId: number,
  completedAtMs: number,
  poseMs: number,
  handsMs: number,
  totalMs: number,
): VisionLandmarkFrame => ({
  frameId,
  capturedAtMs: completedAtMs - totalMs,
  completedAtMs,
  hands: [],
  timing: { poseMs, handsMs, totalMs },
});

describe("VisionDiagnosticsAccumulator", () => {
  it("starts with a stable empty snapshot", () => {
    expect(EMPTY_VISION_DIAGNOSTICS).toEqual({
      completedFrames: 0,
      effectiveFps: 0,
      latestInferenceMs: 0,
      inferenceP50Ms: 0,
      inferenceP95Ms: 0,
      captureToResultP50Ms: 0,
      captureToResultP95Ms: 0,
      submittedFrames: 0,
      sentFrames: 0,
      replacedFrames: 0,
      rejectedFrames: 0,
      replacementRate: 0,
      inFlight: false,
      pending: false,
      presence: false,
      framing: "absent",
      trackingQuality: 0,
      trackingBand: "lost",
      poseVisibility: 0,
      inFrameCoverage: 0,
      handsDetected: 0,
      upperBodyScale: 0,
    });
  });

  it("calculates rolling latency percentiles and inference rate", () => {
    const accumulator = new VisionDiagnosticsAccumulator(5);
    accumulator.record(frame(1, 1000, 4, 6, 14), scheduler());
    accumulator.record(frame(2, 1100, 8, 12, 25), scheduler());
    const result = accumulator.record(
      frame(3, 1200, 12, 18, 38),
      scheduler(),
    );

    expect(result).toMatchObject({
      completedFrames: 3,
      effectiveFps: 10,
      latestInferenceMs: 30,
      inferenceP50Ms: 20,
      inferenceP95Ms: 30,
      captureToResultP50Ms: 25,
      captureToResultP95Ms: 38,
    });
  });

  it("retains only the configured timing window", () => {
    const accumulator = new VisionDiagnosticsAccumulator(2);
    accumulator.record(frame(1, 1000, 2, 3, 8), scheduler());
    accumulator.record(frame(2, 1100, 4, 6, 12), scheduler());
    const result = accumulator.record(
      frame(3, 1200, 8, 12, 25),
      scheduler(),
    );

    expect(result.completedFrames).toBe(3);
    expect(result.inferenceP50Ms).toBe(10);
    expect(result.inferenceP95Ms).toBe(20);
    expect(result.effectiveFps).toBe(10);
  });

  it("reports scheduler backpressure and replacement rate", () => {
    const accumulator = new VisionDiagnosticsAccumulator();
    const result = accumulator.record(
      frame(1, 1000, 5, 5, 12),
      scheduler({
        submitted: 10,
        sent: 7,
        replaced: 3,
        rejected: 1,
        inFlight: true,
        pending: true,
      }),
    );

    expect(result).toMatchObject({
      submittedFrames: 10,
      sentFrames: 7,
      replacedFrames: 3,
      rejectedFrames: 1,
      replacementRate: 0.3,
      inFlight: true,
      pending: true,
    });
  });

  it("rejects an unhelpfully small sample window", () => {
    expect(() => new VisionDiagnosticsAccumulator(1)).toThrow(RangeError);
  });
});
