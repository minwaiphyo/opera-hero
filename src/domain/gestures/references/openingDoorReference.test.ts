import { describe, expect, it } from "vitest";
import { OPENING_DOOR_REFERENCE } from "./openingDoorReference";

describe("OPENING_DOOR_REFERENCE", () => {
  it("contains 41 compact points derived from both normal takes", () => {
    expect(OPENING_DOOR_REFERENCE).toMatchObject({
      schemaVersion: 1,
      gestureId: "opening-door",
      sourceFixtureIds: [
        "opening-door-normal-take-1",
        "opening-door-normal-take-2",
      ],
      derivedFromRecordedImagery: true,
      containsRecordedImagery: false,
      progressPoints: 41,
    });
    expect(OPENING_DOOR_REFERENCE.points).toHaveLength(41);
  });

  it("stores features only, without replay frames or pixels", () => {
    const serialized = JSON.stringify(OPENING_DOOR_REFERENCE);
    expect(serialized).not.toContain('"frames"');
    expect(serialized).not.toContain('"landmarks"');
    expect(serialized).not.toContain("data:image");
  });
});
