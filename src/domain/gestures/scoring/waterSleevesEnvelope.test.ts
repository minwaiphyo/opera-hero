import { describe, expect, it } from "vitest";
import type { WaterSleevesArmFeatures } from "../features/waterSleevesFeatures";
import type { WaterSleevesTrajectory } from "../features/waterSleevesTrajectory";
import {
  buildWaterSleevesReferenceEnvelope,
  compareWaterSleevesTrajectory,
  WATER_SLEEVES_ANGLE_TOLERANCE_RAD,
  WATER_SLEEVES_POSITION_TOLERANCE,
} from "./waterSleevesEnvelope";

describe("Water Sleeves reference envelope", () => {
  it("resamples a trajectory onto deterministic progress points", () => {
    const envelope = buildWaterSleevesReferenceEnvelope(trajectory(), 3);

    expect(envelope.points.map((point) => point.progress)).toEqual([0, 0.5, 1]);
    expect(envelope.progressPoints).toBe(3);
    expect(envelope.containsRecordedImagery).toBe(false);
    expect(envelope.tolerances).toEqual({
      upperArmAngleRad: WATER_SLEEVES_ANGLE_TOLERANCE_RAD,
      elbowPositionShoulderWidths: WATER_SLEEVES_POSITION_TOLERANCE,
    });
  });

  it("uses circular smoothing across the negative-positive angle boundary", () => {
    const source = trajectory([Math.PI - 0.05, -Math.PI + 0.05]);
    const envelope = buildWaterSleevesReferenceEnvelope(source, 2);

    expect(Math.abs(envelope.points[0]!.leftUpperArmAngle!.target)).toBeCloseTo(
      Math.PI,
    );
  });

  it("fits its canonical trajectory inside the broad envelope", () => {
    const source = trajectory();
    const envelope = buildWaterSleevesReferenceEnvelope(source, 5);
    const comparison = compareWaterSleevesTrajectory(source, envelope);

    expect(comparison.overallFit).toBe(1);
    expect(Object.values(comparison.signalFit)).toEqual([1, 1, 1, 1]);
  });

  it("detects a trajectory outside the arm-angle and position tolerances", () => {
    const source = trajectory();
    const envelope = buildWaterSleevesReferenceEnvelope(source, 5);
    const changed = trajectory([2, 2, 2, 2, 2], 1.2);
    const comparison = compareWaterSleevesTrajectory(changed, envelope);

    expect(comparison.overallFit).toBeLessThan(0.5);
  });

  it("requires at least two reference progress points", () => {
    expect(() => buildWaterSleevesReferenceEnvelope(trajectory(), 1)).toThrow(
      "at least two progress points",
    );
  });
});

function trajectory(
  angles = [0, 0.1, 0.2, 0.3, 0.4],
  positionShift = 0,
): WaterSleevesTrajectory {
  const lastIndex = angles.length - 1;
  const samples = angles.map((angle, index) => ({
    offsetMs: index * 100,
    progress: lastIndex > 0 ? index / lastIndex : 0,
    leftArm: arm(angle, -0.5 + positionShift),
    rightArm: arm(-angle, 0.5 + positionShift),
  }));
  return {
    fixtureId: "water-sleeves-canonical",
    durationMs: lastIndex * 100,
    totalFrames: samples.length,
    usableFrames: samples.length,
    samples,
    signals: [],
  };
}

function arm(angle: number, x: number): WaterSleevesArmFeatures {
  return {
    upperArmAngleRad: angle,
    elbowFromShoulder: { x, y: -0.75 },
    elbowAngleRad: null,
    wristFromShoulder: null,
    confidence: 0.9,
  };
}
