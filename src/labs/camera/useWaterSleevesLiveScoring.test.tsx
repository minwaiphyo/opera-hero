import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  VisionLandmark,
  VisionLandmarkFrame,
} from "../../vision/visionTypes";
import {
  WATER_SLEEVES_MAXIMUM_RECORDING_MS,
  WATER_SLEEVES_MAXIMUM_SAMPLES,
  WATER_SLEEVES_MINIMUM_RECORDING_MS,
  useWaterSleevesLiveScoring,
} from "./useWaterSleevesLiveScoring";

afterEach(() => vi.restoreAllMocks());

describe("useWaterSleevesLiveScoring", () => {
  it("protects the complete first reference cycle from automatic termination", () => {
    expect(WATER_SLEEVES_MINIMUM_RECORDING_MS).toBe(7_700);
    expect(WATER_SLEEVES_MAXIMUM_RECORDING_MS).toBeGreaterThan(WATER_SLEEVES_MINIMUM_RECORDING_MS);
    expect(WATER_SLEEVES_MAXIMUM_SAMPLES).toBeGreaterThan(7_700 / 1000 * 60);
  });

  it("scores worker landmark frames and resets for a new camera session", async () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(100);
    const { result, rerender } = renderHook(
      ({ sessionId }) => useWaterSleevesLiveScoring(sessionId),
      { initialProps: { sessionId: "camera-a" as string | null } },
    );

    act(() => result.current.start());
    const startEpoch = performance.timeOrigin + 5200;
    act(() => {
      for (let index = 0; index < 41; index += 1) {
        result.current.onFrame(
          frame(index, startEpoch + index * 50, index * 0.04),
        );
      }
    });
    now.mockReturnValue(8000);
    act(() => result.current.finish());

    expect(result.current.state.snapshot).toMatchObject({
      status: "completed",
      bufferedSamples: 41,
      usableSamples: 41,
    });
    expect(result.current.state.evaluation).not.toBeNull();
    expect(result.current.state.evaluation?.alignedPairs).toBeGreaterThan(0);

    rerender({ sessionId: "camera-b" });
    await waitFor(() => {
      expect(result.current.state.snapshot.status).toBe("idle");
      expect(result.current.state.evaluation).toBeNull();
    });
  });
});

function frame(
  frameId: number,
  capturedAtMs: number,
  armOffset: number,
): VisionLandmarkFrame {
  const landmarks = Array.from({ length: 33 }, () => point(0, 0));
  landmarks[11] = point(0.4, 0.3);
  landmarks[12] = point(0.6, 0.3);
  landmarks[13] = point(0.3 + armOffset, 0.45);
  landmarks[14] = point(0.7 - armOffset, 0.45);
  landmarks[15] = point(0.25 + armOffset, 0.6);
  landmarks[16] = point(0.75 - armOffset, 0.6);
  return {
    frameId,
    capturedAtMs,
    completedAtMs: capturedAtMs + 10,
    pose: { landmarks, worldLandmarks: landmarks },
    hands: [],
    timing: { poseMs: 5, handsMs: 0, totalMs: 5 },
  };
}

function point(x: number, y: number): VisionLandmark {
  return { x, y, z: 0, visibility: 0.95 };
}
