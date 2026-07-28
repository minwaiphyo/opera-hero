import { describe, expect, it } from "vitest";
import { calculateCameraStability } from "./cameraStability";

describe("calculateCameraStability", () => {
  it("calculates observed frame, drop, stall, and heap metrics", () => {
    const metrics = calculateCameraStability([
      {
        capturedAtMs: 1000,
        totalVideoFrames: 30,
        droppedVideoFrames: 1,
        usedHeapBytes: 10_000_000,
      },
      {
        capturedAtMs: 2000,
        totalVideoFrames: 60,
        droppedVideoFrames: 2,
        usedHeapBytes: 12_000_000,
      },
      {
        capturedAtMs: 3000,
        totalVideoFrames: 60,
        droppedVideoFrames: 2,
        usedHeapBytes: 11_000_000,
      },
    ]);

    expect(metrics).toMatchObject({
      elapsedMs: 2000,
      renderedFrames: 29,
      droppedFrames: 1,
      observedFrameRate: 14.5,
      stalledSamples: 1,
      initialHeapBytes: 10_000_000,
      currentHeapBytes: 11_000_000,
      peakHeapBytes: 12_000_000,
    });
    expect(metrics.droppedFrameRate).toBeCloseTo(1 / 30);
  });

  it("returns zeroed metrics until samples exist", () => {
    expect(calculateCameraStability([])).toEqual({
      elapsedMs: 0,
      renderedFrames: 0,
      droppedFrames: 0,
      observedFrameRate: 0,
      droppedFrameRate: 0,
      stalledSamples: 0,
    });
  });
});
