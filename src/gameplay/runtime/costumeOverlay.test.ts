import { describe, expect, it } from "vitest";
import type { VisionLandmark } from "../../vision/visionTypes";
import {
  calculateCostumePlacement,
  COSTUME_TRACKING_GRACE_MS,
  updateCostumeTracking,
} from "./costumeOverlay";

const projection = {
  toX: (x: number) => 1000 - x * 1000,
  toY: (y: number) => y * 1000,
  scale: 1,
};

function pose(visibility = 0.95): VisionLandmark[] {
  const landmarks = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility,
  }));
  landmarks[0] = { x: 0.5, y: 0.25, z: 0, visibility };
  landmarks[11] = { x: 0.35, y: 0.5, z: 0, visibility };
  landmarks[12] = { x: 0.65, y: 0.5, z: 0, visibility };
  return landmarks;
}

describe("costume overlay placement", () => {
  it("centres a close-fitting frame just beyond the visitor's shoulders", () => {
    const placement = calculateCostumePlacement(pose(), projection);

    expect(placement).not.toBeNull();
    expect(placement!.x + placement!.width / 2).toBeCloseTo(500);
    expect(placement!.width).toBeCloseTo(500);
    expect(placement!.width).toBeGreaterThan(300);
    expect(placement!.y).toBeCloseTo(50);
    expect(placement!.height).toBe(placement!.width);
  });

  it("does not leave a floating costume when pose tracking is unreliable", () => {
    expect(calculateCostumePlacement(pose(0.2), projection)).toBeNull();
  });

  it("requires both a usable head and shoulder span", () => {
    const collapsed = pose();
    collapsed[11] = { ...collapsed[11]!, x: 0.5 };
    collapsed[12] = { ...collapsed[12]!, x: 0.5 };

    expect(calculateCostumePlacement(collapsed, projection)).toBeNull();
  });

  it("bridges an isolated low-confidence frame without flickering", () => {
    const detected = calculateCostumePlacement(pose(), projection)!;
    const tracked = updateCostumeTracking(null, detected, 1_000);

    expect(updateCostumeTracking(tracked, null, 1_200)).toEqual(tracked);
    expect(
      updateCostumeTracking(tracked, null, 1_000 + COSTUME_TRACKING_GRACE_MS + 1),
    ).toBeNull();
  });

  it("smooths sudden placement changes between reliable frames", () => {
    const first = calculateCostumePlacement(pose(), projection)!;
    const shiftedPose = pose();
    shiftedPose[11] = { ...shiftedPose[11]!, x: 0.25 };
    shiftedPose[12] = { ...shiftedPose[12]!, x: 0.55 };
    const shifted = calculateCostumePlacement(shiftedPose, projection)!;

    const initial = updateCostumeTracking(null, first, 1_000)!;
    const smoothed = updateCostumeTracking(initial, shifted, 1_050)!;

    expect(smoothed.placement.x).toBeGreaterThan(first.x);
    expect(smoothed.placement.x).toBeLessThan(shifted.x);
  });
});
