import type { Vector2 } from "../features/geometry";
import type {
  OpeningDoorTrajectory,
  OpeningDoorTrajectorySample,
} from "../features/openingDoorTrajectory";
import type {
  ScalarEnvelopeValue,
  VectorEnvelopeValue,
} from "./waterSleevesEnvelope";

export const OPENING_DOOR_REFERENCE_SCHEMA_VERSION = 1 as const;
export const OPENING_DOOR_REFERENCE_POINTS = 41;
export const OPENING_DOOR_POSITION_TOLERANCE = 0.45;
export const OPENING_DOOR_ANGLE_TOLERANCE_RAD = Math.PI / 4;
export const OPENING_DOOR_OPENNESS_TOLERANCE = 0.75;

export interface OpeningDoorEnvelopePoint {
  progress: number;
  leftElbowPosition: VectorEnvelopeValue | null;
  rightElbowPosition: VectorEnvelopeValue | null;
  leftWristPosition: VectorEnvelopeValue | null;
  rightWristPosition: VectorEnvelopeValue | null;
  leftPalmPosition: VectorEnvelopeValue | null;
  rightPalmPosition: VectorEnvelopeValue | null;
  leftPalmDirection: ScalarEnvelopeValue | null;
  rightPalmDirection: ScalarEnvelopeValue | null;
  leftHandOpenness: ScalarEnvelopeValue | null;
  rightHandOpenness: ScalarEnvelopeValue | null;
}

export interface OpeningDoorReferenceEnvelope {
  schemaVersion: typeof OPENING_DOOR_REFERENCE_SCHEMA_VERSION;
  gestureId: "opening-door";
  sourceFixtureIds: readonly string[];
  derivedFromRecordedImagery: true;
  containsRecordedImagery: false;
  progressPoints: number;
  smoothingWindow: number;
  tolerances: {
    positionShoulderWidths: number;
    palmDirectionRad: number;
    handOpenness: number;
  };
  points: readonly OpeningDoorEnvelopePoint[];
}

export function buildOpeningDoorReferenceEnvelope(
  trajectories: readonly OpeningDoorTrajectory[],
  progressPoints = OPENING_DOOR_REFERENCE_POINTS,
): OpeningDoorReferenceEnvelope {
  if (trajectories.length === 0) {
    throw new Error("Opening Door requires at least one reference trajectory.");
  }
  if (progressPoints < 2) {
    throw new Error("An Opening Door envelope requires at least two progress points.");
  }
  const smoothingWindow = 1 / (progressPoints - 1);
  const points = Array.from({ length: progressPoints }, (_, index) => {
    const progress = index / (progressPoints - 1);
    const samples = referenceSamples(trajectories, progress, smoothingWindow);
    return {
      progress,
      leftElbowPosition: vectorValue(samples, (sample) => sample.leftArm?.elbowFromShoulder),
      rightElbowPosition: vectorValue(samples, (sample) => sample.rightArm?.elbowFromShoulder),
      leftWristPosition: vectorValue(samples, (sample) => sample.leftArm?.wristFromShoulder),
      rightWristPosition: vectorValue(samples, (sample) => sample.rightArm?.wristFromShoulder),
      leftPalmPosition: vectorValue(samples, (sample) => sample.leftHand?.palmCenterFromBody),
      rightPalmPosition: vectorValue(samples, (sample) => sample.rightHand?.palmCenterFromBody),
      leftPalmDirection: circularValue(samples, (sample) => sample.leftHand?.palmDirectionRad),
      rightPalmDirection: circularValue(samples, (sample) => sample.rightHand?.palmDirectionRad),
      leftHandOpenness: scalarValue(samples, (sample) => sample.leftHand?.openness),
      rightHandOpenness: scalarValue(samples, (sample) => sample.rightHand?.openness),
    };
  });
  return {
    schemaVersion: OPENING_DOOR_REFERENCE_SCHEMA_VERSION,
    gestureId: "opening-door",
    sourceFixtureIds: trajectories.map((trajectory) => trajectory.fixtureId),
    derivedFromRecordedImagery: true,
    containsRecordedImagery: false,
    progressPoints,
    smoothingWindow,
    tolerances: {
      positionShoulderWidths: OPENING_DOOR_POSITION_TOLERANCE,
      palmDirectionRad: OPENING_DOOR_ANGLE_TOLERANCE_RAD,
      handOpenness: OPENING_DOOR_OPENNESS_TOLERANCE,
    },
    points,
  };
}

function referenceSamples(
  trajectories: readonly OpeningDoorTrajectory[],
  progress: number,
  window: number,
): readonly OpeningDoorTrajectorySample[] {
  return trajectories.flatMap((trajectory) => {
    const nearby = trajectory.samples.filter(
      (sample) => Math.abs(sample.progress - progress) <= window,
    );
    if (nearby.length > 0) return nearby;
    const nearest = [...trajectory.samples].sort(
      (a, b) => Math.abs(a.progress - progress) - Math.abs(b.progress - progress),
    )[0];
    return nearest ? [nearest] : [];
  });
}

function vectorValue(
  samples: readonly OpeningDoorTrajectorySample[],
  select: (sample: OpeningDoorTrajectorySample) => Vector2 | null | undefined,
): VectorEnvelopeValue | null {
  const values = samples.map(select).filter((value): value is Vector2 => value != null);
  if (values.length === 0) return null;
  return {
    target: {
      x: median(values.map((value) => value.x)),
      y: median(values.map((value) => value.y)),
    },
    tolerance: OPENING_DOOR_POSITION_TOLERANCE,
  };
}

function scalarValue(
  samples: readonly OpeningDoorTrajectorySample[],
  select: (sample: OpeningDoorTrajectorySample) => number | null | undefined,
): ScalarEnvelopeValue | null {
  const values = samples.map(select).filter((value): value is number => value != null);
  return values.length > 0
    ? { target: median(values), tolerance: OPENING_DOOR_OPENNESS_TOLERANCE }
    : null;
}

function circularValue(
  samples: readonly OpeningDoorTrajectorySample[],
  select: (sample: OpeningDoorTrajectorySample) => number | null | undefined,
): ScalarEnvelopeValue | null {
  const values = samples.map(select).filter((value): value is number => value != null);
  if (values.length === 0) return null;
  const sine = values.reduce((sum, value) => sum + Math.sin(value), 0);
  const cosine = values.reduce((sum, value) => sum + Math.cos(value), 0);
  return {
    target: Math.atan2(sine, cosine),
    tolerance: OPENING_DOOR_ANGLE_TOLERANCE_RAD,
  };
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
}
