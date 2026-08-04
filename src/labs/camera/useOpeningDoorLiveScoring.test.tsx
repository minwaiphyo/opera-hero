import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { VisionLandmark, VisionLandmarkFrame } from "../../vision/visionTypes";
import {
  OPENING_DOOR_MAXIMUM_RECORDING_MS,
  OPENING_DOOR_MAXIMUM_SAMPLES,
  OPENING_DOOR_MINIMUM_RECORDING_MS,
  useOpeningDoorLiveScoring,
} from "./useOpeningDoorLiveScoring";

afterEach(() => vi.restoreAllMocks());

describe("useOpeningDoorLiveScoring", () => {
  it("protects the complete first reference cycle from automatic termination", () => {
    expect(OPENING_DOOR_MINIMUM_RECORDING_MS).toBe(8_700);
    expect(OPENING_DOOR_MAXIMUM_RECORDING_MS).toBeGreaterThan(OPENING_DOOR_MINIMUM_RECORDING_MS);
    expect(OPENING_DOOR_MAXIMUM_SAMPLES).toBeGreaterThan(8_700 / 1000 * 60);
  });

  it("scores captured worker frames and resets for a new camera session", async () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(100);
    const { result, rerender } = renderHook(
      ({ sessionId }) => useOpeningDoorLiveScoring(sessionId),
      { initialProps: { sessionId: "camera-a" as string | null } },
    );
    act(() => result.current.start());
    const startEpoch = performance.timeOrigin + 5200;
    act(() => {
      for (let index = 0; index < 41; index += 1) {
        result.current.onFrame(frame(index, startEpoch + index * 50, index * 0.005));
      }
    });
    now.mockReturnValue(8000);
    act(() => result.current.finish());

    expect(result.current.state.snapshot.status).toBe("completed");
    expect(result.current.state.evaluation).not.toBeNull();
    expect(result.current.state.evaluation?.alignedPairs).toBeGreaterThan(0);

    rerender({ sessionId: "camera-b" });
    await waitFor(() => {
      expect(result.current.state.snapshot.status).toBe("idle");
      expect(result.current.state.evaluation).toBeNull();
    });
  });
});

function frame(frameId: number, capturedAtMs: number, offset: number): VisionLandmarkFrame {
  const landmarks = Array.from({ length: 33 }, () => point(0, 0));
  landmarks[11] = point(0.4, 0.3);
  landmarks[12] = point(0.6, 0.3);
  landmarks[13] = point(0.35 - offset, 0.45);
  landmarks[14] = point(0.65 + offset, 0.45);
  landmarks[15] = point(0.3 - offset, 0.55);
  landmarks[16] = point(0.7 + offset, 0.55);
  return {
    frameId,
    capturedAtMs,
    completedAtMs: capturedAtMs + 10,
    pose: { landmarks, worldLandmarks: landmarks },
    hands: [],
    timing: { poseMs: 5, handsMs: 5, totalMs: 10 },
  };
}

function point(x: number, y: number): VisionLandmark {
  return { x, y, z: 0, visibility: 0.95 };
}
