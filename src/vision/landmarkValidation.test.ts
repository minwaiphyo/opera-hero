import { describe, expect, it } from "vitest";
import { FakeVisionAdapter } from "./fakeVisionAdapter";
import {
  isLandmarkFrame,
  isNormalizedHand,
  isNormalizedLandmark,
  isNormalizedPose,
} from "./landmarkValidation";

describe("landmark validation", () => {
  it("accepts valid normalized landmarks and rejects unsafe coordinates", () => {
    expect(isNormalizedLandmark({ x: 0.5, y: 0.2, z: -0.1 })).toBe(true);
    expect(isNormalizedLandmark({ x: 1.1, y: 0.2, z: 0 })).toBe(false);
    expect(
      isNormalizedLandmark({ x: 0.5, y: 0.2, z: 0, visibility: 2 }),
    ).toBe(false);
  });

  it("enforces MediaPipe-compatible pose and hand landmark counts", () => {
    const landmark = { x: 0.5, y: 0.5, z: 0 };
    expect(
      isNormalizedPose({ landmarks: Array.from({ length: 33 }, () => landmark) }),
    ).toBe(true);
    expect(
      isNormalizedPose({ landmarks: Array.from({ length: 32 }, () => landmark) }),
    ).toBe(false);
    expect(
      isNormalizedHand({
        handedness: "left",
        score: 0.9,
        landmarks: Array.from({ length: 21 }, () => landmark),
      }),
    ).toBe(true);
  });

  it("rejects malformed landmark frames at the adapter boundary", async () => {
    const adapter = new FakeVisionAdapter();
    await adapter.initialize();
    const frame = await adapter.process({
      frameId: 1,
      timestampMs: 100,
      width: 1280,
      height: 720,
    });

    expect(isLandmarkFrame(frame)).toBe(true);
    expect(isLandmarkFrame({ ...frame, trackingQuality: 1.5 })).toBe(false);
  });
});
