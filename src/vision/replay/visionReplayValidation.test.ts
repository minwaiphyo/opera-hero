import { describe, expect, it } from "vitest";
import emptyZoneJson from "./fixtures/empty-zone.json";
import {
  parseVisionReplayFixture,
  VisionReplayValidationError,
} from "./visionReplayValidation";

describe("parseVisionReplayFixture", () => {
  it("accepts the versioned deterministic empty-zone fixture", () => {
    const fixture = parseVisionReplayFixture(emptyZoneJson);

    expect(fixture).toMatchObject({
      schemaVersion: 1,
      id: "empty-zone",
      source: "synthetic",
      containsRecordedImagery: false,
    });
    expect(fixture.frames).toHaveLength(5);
    expect(fixture.frames.map((frame) => frame.offsetMs)).toEqual([
      0, 50, 100, 150, 200,
    ]);
  });

  it("rejects unsupported schema versions", () => {
    expect(() =>
      parseVisionReplayFixture({ ...emptyZoneJson, schemaVersion: 2 }),
    ).toThrow("Unsupported replay schema version: 2.");
  });

  it("rejects non-monotonic frame offsets", () => {
    expect(() =>
      parseVisionReplayFixture({
        ...emptyZoneJson,
        frames: [
          { offsetMs: 0, hands: [] },
          { offsetMs: 0, hands: [] },
        ],
      }),
    ).toThrow("Replay frame offsets must be strictly increasing.");
  });

  it("rejects malformed landmark payloads", () => {
    expect(() =>
      parseVisionReplayFixture({
        ...emptyZoneJson,
        frames: [
          {
            offsetMs: 0,
            pose: {
              landmarks: [{ x: 0.5, y: 0.5, z: 0, visibility: 1 }],
              worldLandmarks: [],
            },
            hands: [],
          },
        ],
      }),
    ).toThrow("Replay frame 0 is malformed.");
  });

  it("rejects fixtures that claim to contain imagery", () => {
    expect(() =>
      parseVisionReplayFixture({
        ...emptyZoneJson,
        containsRecordedImagery: true,
      }),
    ).toThrow("Landmark replays must not contain recorded imagery.");
  });

  it("uses a dedicated error type for callers", () => {
    expect(() => parseVisionReplayFixture(null)).toThrow(
      VisionReplayValidationError,
    );
  });
});
