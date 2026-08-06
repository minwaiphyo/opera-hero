import type { Vector2 } from "../features/geometry";
import type {
  WaterSleevesTrajectory,
  WaterSleevesTrajectorySample,
} from "../features/waterSleevesTrajectory";

export const WATER_SLEEVES_REFERENCE_SCHEMA_VERSION = 1 as const;
export const WATER_SLEEVES_REFERENCE_POINTS = 41;
export const WATER_SLEEVES_ANGLE_TOLERANCE_RAD = Math.PI / 6;
export const WATER_SLEEVES_POSITION_TOLERANCE = 0.5;

export interface ScalarEnvelopeValue {
  target: number;
  tolerance: number;
}

export interface VectorEnvelopeValue {
  target: Vector2;
  tolerance: number;
}

export interface WaterSleevesEnvelopePoint {
  progress: number;
  leftUpperArmAngle: ScalarEnvelopeValue | null;
  rightUpperArmAngle: ScalarEnvelopeValue | null;
  leftElbowPosition: VectorEnvelopeValue | null;
  rightElbowPosition: VectorEnvelopeValue | null;
}

export interface WaterSleevesReferenceEnvelope {
  schemaVersion: typeof WATER_SLEEVES_REFERENCE_SCHEMA_VERSION;
  gestureId: "water-sleeves";
  sourceFixtureId: string;
  derivedFromRecordedImagery: true;
  containsRecordedImagery: false;
  progressPoints: number;
  smoothingWindow: number;
  tolerances: {
    upperArmAngleRad: number;
    elbowPositionShoulderWidths: number;
  };
  points: readonly WaterSleevesEnvelopePoint[];
}

export interface WaterSleevesEnvelopeComparison {
  comparedFixtureId: string;
  overallFit: number;
  signalFit: {
    leftUpperArmAngle: number;
    rightUpperArmAngle: number;
    leftElbowPosition: number;
    rightElbowPosition: number;
  };
}

export function buildWaterSleevesReferenceEnvelope(
  trajectory: WaterSleevesTrajectory,
  progressPoints = WATER_SLEEVES_REFERENCE_POINTS,
): WaterSleevesReferenceEnvelope {
  if (progressPoints < 2) {
    throw new Error("A reference envelope requires at least two progress points.");
  }
  const smoothingWindow = 1 / (progressPoints - 1);
  const points = Array.from({ length: progressPoints }, (_, index) => {
    const progress = index / (progressPoints - 1);
    const nearby = samplesNear(trajectory.samples, progress, smoothingWindow);
    return {
      progress,
      leftUpperArmAngle: scalarEnvelope(
        nearby,
        trajectory.samples,
        progress,
        "leftArm",
        "upperArmAngleRad",
      ),
      rightUpperArmAngle: scalarEnvelope(
        nearby,
        trajectory.samples,
        progress,
        "rightArm",
        "upperArmAngleRad",
      ),
      leftElbowPosition: vectorEnvelope(
        nearby,
        trajectory.samples,
        progress,
        "leftArm",
      ),
      rightElbowPosition: vectorEnvelope(
        nearby,
        trajectory.samples,
        progress,
        "rightArm",
      ),
    };
  });

  return {
    schemaVersion: WATER_SLEEVES_REFERENCE_SCHEMA_VERSION,
    gestureId: "water-sleeves",
    sourceFixtureId: trajectory.fixtureId,
    derivedFromRecordedImagery: true,
    containsRecordedImagery: false,
    progressPoints,
    smoothingWindow,
    tolerances: {
      upperArmAngleRad: WATER_SLEEVES_ANGLE_TOLERANCE_RAD,
      elbowPositionShoulderWidths: WATER_SLEEVES_POSITION_TOLERANCE,
    },
    points,
  };
}

export function compareWaterSleevesTrajectory(
  trajectory: WaterSleevesTrajectory,
  envelope: WaterSleevesReferenceEnvelope,
): WaterSleevesEnvelopeComparison {
  const candidate = buildWaterSleevesReferenceEnvelope(
    trajectory,
    envelope.progressPoints,
  );
  const signalFit = {
    leftUpperArmAngle: scalarFit(
      candidate.points,
      envelope.points,
      "leftUpperArmAngle",
    ),
    rightUpperArmAngle: scalarFit(
      candidate.points,
      envelope.points,
      "rightUpperArmAngle",
    ),
    leftElbowPosition: vectorFit(
      candidate.points,
      envelope.points,
      "leftElbowPosition",
    ),
    rightElbowPosition: vectorFit(
      candidate.points,
      envelope.points,
      "rightElbowPosition",
    ),
  };
  const values = Object.values(signalFit);
  return {
    comparedFixtureId: trajectory.fixtureId,
    overallFit: values.reduce((sum, value) => sum + value, 0) / values.length,
    signalFit,
  };
}

function samplesNear(
  samples: readonly WaterSleevesTrajectorySample[],
  progress: number,
  window: number,
): readonly WaterSleevesTrajectorySample[] {
  const nearby = samples.filter(
    (sample) => Math.abs(sample.progress - progress) <= window,
  );
  if (nearby.length > 0) {
    return nearby;
  }
  const nearest = [...samples].sort(
    (a, b) =>
      Math.abs(a.progress - progress) - Math.abs(b.progress - progress),
  )[0];
  return nearest ? [nearest] : [];
}

function scalarEnvelope(
  samples: readonly WaterSleevesTrajectorySample[],
  allSamples: readonly WaterSleevesTrajectorySample[],
  progress: number,
  side: "leftArm" | "rightArm",
  feature: "upperArmAngleRad",
): ScalarEnvelopeValue | null {
  let values = samples
    .map((sample) => sample[side]?.[feature])
    .filter((value): value is number => value !== undefined);
  if (values.length === 0) {
    const nearest = nearestSampleWithArm(allSamples, progress, side);
    values = nearest ? [nearest[side]![feature]] : [];
  }
  if (values.length === 0) return null;
  return {
    target: circularMean(values),
    tolerance: WATER_SLEEVES_ANGLE_TOLERANCE_RAD,
  };
}

function vectorEnvelope(
  samples: readonly WaterSleevesTrajectorySample[],
  allSamples: readonly WaterSleevesTrajectorySample[],
  progress: number,
  side: "leftArm" | "rightArm",
): VectorEnvelopeValue | null {
  let values = samples
    .map((sample) => sample[side]?.elbowFromShoulder)
    .filter((value): value is Vector2 => value !== undefined);
  if (values.length === 0) {
    const nearest = nearestSampleWithArm(allSamples, progress, side);
    values = nearest ? [nearest[side]!.elbowFromShoulder] : [];
  }
  if (values.length === 0) return null;
  return {
    target: {
      x: median(values.map((value) => value.x)),
      y: median(values.map((value) => value.y)),
    },
    tolerance: WATER_SLEEVES_POSITION_TOLERANCE,
  };
}

function nearestSampleWithArm(
  samples: readonly WaterSleevesTrajectorySample[],
  progress: number,
  side: "leftArm" | "rightArm",
): WaterSleevesTrajectorySample | undefined {
  return samples
    .filter((sample) => sample[side] !== null)
    .sort(
      (a, b) =>
        Math.abs(a.progress - progress) - Math.abs(b.progress - progress),
    )[0];
}

function circularMean(values: readonly number[]): number {
  const sine = values.reduce((sum, value) => sum + Math.sin(value), 0);
  const cosine = values.reduce((sum, value) => sum + Math.cos(value), 0);
  return Math.atan2(sine, cosine);
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
}

function scalarFit(
  candidate: readonly WaterSleevesEnvelopePoint[],
  reference: readonly WaterSleevesEnvelopePoint[],
  key: "leftUpperArmAngle" | "rightUpperArmAngle",
): number {
  return fitFraction<ScalarEnvelopeValue>(candidate, reference, key, (actual, expected) =>
    angularDistance(actual.target, expected.target) <= expected.tolerance,
  );
}

function vectorFit(
  candidate: readonly WaterSleevesEnvelopePoint[],
  reference: readonly WaterSleevesEnvelopePoint[],
  key: "leftElbowPosition" | "rightElbowPosition",
): number {
  return fitFraction<VectorEnvelopeValue>(candidate, reference, key, (actual, expected) =>
    Math.hypot(
      actual.target.x - expected.target.x,
      actual.target.y - expected.target.y,
    ) <= expected.tolerance,
  );
}

function fitFraction<T extends ScalarEnvelopeValue | VectorEnvelopeValue>(
  candidate: readonly WaterSleevesEnvelopePoint[],
  reference: readonly WaterSleevesEnvelopePoint[],
  key:
    | "leftUpperArmAngle"
    | "rightUpperArmAngle"
    | "leftElbowPosition"
    | "rightElbowPosition",
  within: (actual: T, expected: T) => boolean,
): number {
  let compared = 0;
  let matches = 0;
  reference.forEach((point, index) => {
    const expected = point[key] as T | null;
    const actual = candidate[index]?.[key] as T | null | undefined;
    if (!expected || !actual) return;
    compared += 1;
    if (within(actual, expected)) matches += 1;
  });
  return compared > 0 ? matches / compared : 0;
}

function angularDistance(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}
