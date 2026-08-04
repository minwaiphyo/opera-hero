import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { VisionLandmark, VisionLandmarkFrame } from "../../vision/visionTypes";
import {
  ORCHID_FINGER_STILLNESS_DURATION_MS,
  ORCHID_FINGER_STILLNESS_THRESHOLD,
  ORCHID_FINGER_MINIMUM_RECORDING_MS,
  ORCHID_FINGER_MAXIMUM_DURATION_MS,
  ORCHID_FINGER_MAXIMUM_SAMPLES,
  useOrchidFingerLiveScoring,
} from "./useOrchidFingerLiveScoring";

afterEach(() => vi.restoreAllMocks());
describe("useOrchidFingerLiveScoring", () => {
  it("allows a two-second stationary hold before automatic completion", () => {
    expect(ORCHID_FINGER_STILLNESS_DURATION_MS).toBe(2_000);
    expect(ORCHID_FINGER_STILLNESS_THRESHOLD).toBe(0.08);
    expect(ORCHID_FINGER_MINIMUM_RECORDING_MS).toBe(15_600);
    expect(ORCHID_FINGER_MAXIMUM_DURATION_MS).toBe(30_000);
    expect(ORCHID_FINGER_MAXIMUM_SAMPLES).toBe(1_200);
  });

  it("scores worker frames and resets for a new camera session", async () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(100);
    const { result, rerender } = renderHook(({ sessionId }) => useOrchidFingerLiveScoring(sessionId), { initialProps: { sessionId: "camera-a" as string | null } });
    act(() => result.current.start());
    const startEpoch = performance.timeOrigin + 5200;
    act(() => { for (let index = 0; index < 41; index++) result.current.onFrame(frame(index, startEpoch + index * 50)); });
    now.mockReturnValue(8000); act(() => result.current.finish());
    expect(result.current.state.snapshot.status).toBe("completed");
    expect(result.current.state.evaluation?.alignedPairs).toBeGreaterThan(0);
    rerender({ sessionId: "camera-b" });
    await waitFor(() => expect(result.current.state.evaluation).toBeNull());
  });
});
function frame(frameId: number, capturedAtMs: number): VisionLandmarkFrame {
  const landmarks = Array.from({ length: 33 }, () => point(0, 0));
  landmarks[11] = point(0.4, 0.3); landmarks[12] = point(0.6, 0.3); landmarks[13] = point(0.35, 0.45); landmarks[14] = point(0.65, 0.45); landmarks[15] = point(0.3, 0.55); landmarks[16] = point(0.7, 0.55);
  return { frameId, capturedAtMs, completedAtMs: capturedAtMs + 10, pose: { landmarks, worldLandmarks: landmarks }, hands: [], timing: { poseMs: 5, handsMs: 5, totalMs: 10 } };
}
function point(x: number, y: number): VisionLandmark { return { x, y, z: 0, visibility: 0.95 }; }
