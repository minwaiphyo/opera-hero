import { describe, expect, it } from "vitest";
import { WATER_SLEEVES_REFERENCE } from "./waterSleevesReference";

describe("committed Water Sleeves reference", () => {
  it("contains the expected compact, image-free provenance", () => {
    expect(WATER_SLEEVES_REFERENCE).toMatchObject({
      schemaVersion: 1,
      gestureId: "water-sleeves",
      sourceFixtureId: "water-sleeves-front-with-sleeves",
      derivedFromRecordedImagery: true,
      containsRecordedImagery: false,
      progressPoints: 41,
    });
    expect(WATER_SLEEVES_REFERENCE.points).toHaveLength(41);
  });

  it("contains all required core targets at every progress point", () => {
    for (const point of WATER_SLEEVES_REFERENCE.points) {
      expect(point.leftUpperArmAngle).not.toBeNull();
      expect(point.rightUpperArmAngle).not.toBeNull();
      expect(point.leftElbowPosition).not.toBeNull();
      expect(point.rightElbowPosition).not.toBeNull();
    }
  });
});
