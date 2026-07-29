import { describe, expect, it } from "vitest";
import { FakeVisionAdapter } from "./fakeVisionAdapter";
import { isVisionWorkerResponse } from "./visionWorkerProtocol";

describe("vision worker protocol", () => {
  it("accepts every safe control response", () => {
    expect(
      isVisionWorkerResponse({
        type: "ready",
        capabilities: {
          adapter: "MediaPipe",
          runtime: "mediapipe-worker",
          model: "full",
          poseLandmarkCount: 33,
          handLandmarkCount: 21,
          maxHands: 2,
        },
      }),
    ).toBe(true);
    expect(
      isVisionWorkerResponse({
        type: "frame-skipped",
        frameId: 3,
        reason: "busy",
      }),
    ).toBe(true);
    expect(isVisionWorkerResponse({ type: "disposed" })).toBe(true);
  });

  it("accepts valid results and rejects malformed worker messages", async () => {
    const adapter = new FakeVisionAdapter();
    await adapter.initialize();
    const frame = await adapter.process({
      frameId: 2,
      timestampMs: 200,
      width: 1280,
      height: 720,
    });

    expect(isVisionWorkerResponse({ type: "result", frame })).toBe(true);
    expect(
      isVisionWorkerResponse({
        type: "frame-skipped",
        frameId: "3",
        reason: "busy",
      }),
    ).toBe(false);
    expect(isVisionWorkerResponse({ type: "mystery" })).toBe(false);
  });
});
