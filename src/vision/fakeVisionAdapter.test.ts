import { describe, expect, it } from "vitest";
import { FakeVisionAdapter } from "./fakeVisionAdapter";
import { isLandmarkFrame } from "./landmarkValidation";

describe("FakeVisionAdapter", () => {
  it("initializes and produces deterministic valid landmark frames", async () => {
    const adapter = new FakeVisionAdapter();
    const capabilities = await adapter.initialize();

    const first = await adapter.process({
      frameId: 7,
      timestampMs: 1400,
      width: 1280,
      height: 720,
    });
    const second = await adapter.process({
      frameId: 7,
      timestampMs: 1400,
      width: 1280,
      height: 720,
    });

    expect(capabilities).toMatchObject({
      runtime: "fake",
      model: "simulated",
      poseLandmarkCount: 33,
      handLandmarkCount: 21,
      maxHands: 2,
    });
    expect(first).toEqual(second);
    expect(first.pose?.landmarks).toHaveLength(33);
    expect(first.hands).toHaveLength(2);
    expect(first.hands[0].landmarks).toHaveLength(21);
    expect(isLandmarkFrame(first)).toBe(true);
  });

  it("requires initialization and cannot be reused after disposal", async () => {
    const adapter = new FakeVisionAdapter();
    const input = {
      frameId: 1,
      timestampMs: 0,
      width: 1280,
      height: 720,
    };

    await expect(adapter.process(input)).rejects.toThrow("Initialize");
    await adapter.initialize();
    await adapter.dispose();
    await expect(adapter.process(input)).rejects.toThrow("Initialize");
    await expect(adapter.initialize()).rejects.toThrow("disposed");
  });
});
