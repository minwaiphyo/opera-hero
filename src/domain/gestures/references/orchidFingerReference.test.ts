import { describe, expect, it } from "vitest";
import { ORCHID_FINGER_REFERENCE } from "./orchidFingerReference";

describe("ORCHID_FINGER_REFERENCE", () => {
  it("contains 41 compact points derived from all normal takes", () => {
    expect(ORCHID_FINGER_REFERENCE).toMatchObject({ schemaVersion: 1, gestureId: "orchid-finger", sourceFixtureIds: ["orchid-finger-normal-take-1", "orchid-finger-normal-take-2", "orchid-finger-normal-take-3"], derivedFromRecordedImagery: true, containsRecordedImagery: false, progressPoints: 41 });
    expect(ORCHID_FINGER_REFERENCE.points).toHaveLength(41);
  });
  it("stores features only, without replay frames or pixels", () => {
    const serialized = JSON.stringify(ORCHID_FINGER_REFERENCE);
    expect(serialized).not.toContain('"frames"'); expect(serialized).not.toContain('"landmarks"'); expect(serialized).not.toContain("data:image");
  });
});
