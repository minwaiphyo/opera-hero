import { describe, expect, it } from "vitest";
import { WATER_SLEEVES_REFERENCE } from "../references/waterSleevesReference";
import {
  runWaterSleevesRegressions,
  trajectoryFromReference,
} from "./waterSleevesRegressions";

describe("Water Sleeves deterministic regressions", () => {
  const results = runWaterSleevesRegressions(WATER_SLEEVES_REFERENCE);

  it.each(results)("passes $id", (result) => {
    expect(result.passed, JSON.stringify(result, null, 2)).toBe(true);
  });

  it("keeps timing and conservative-noise scenarios strong", () => {
    for (const id of [
      "slower-timing",
      "faster-timing",
      "conservative-noise",
    ]) {
      const result = results.find((candidate) => candidate.id === id)!;
      expect(result.evaluation.overallScore).toBeGreaterThanOrEqual(0.9);
      expect(result.evaluation.trackingStatus).toBe("good");
    }
  });

  it("separates movement mismatch from tracking insufficiency", () => {
    const displaced = results.find(
      (result) => result.id === "displaced-arm-path",
    )!;
    const occluded = results.find(
      (result) => result.id === "prolonged-occlusion",
    )!;

    expect(displaced.evaluation.trackingStatus).toBe("good");
    expect(displaced.evaluation.overallScore).toBeLessThan(0.5);
    expect(occluded.evaluation.trackingStatus).toBe("insufficient");
  });

  it("creates an image-free nominal trajectory from the compact reference", () => {
    const trajectory = trajectoryFromReference(WATER_SLEEVES_REFERENCE);

    expect(trajectory.samples).toHaveLength(41);
    expect(trajectory.samples[0]!.leftArm?.wristFromShoulder).toBeNull();
    expect(trajectory.samples[0]!.rightArm?.elbowAngleRad).toBeNull();
  });
});
