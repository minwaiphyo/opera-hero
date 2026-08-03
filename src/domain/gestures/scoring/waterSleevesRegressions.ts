import type { WaterSleevesArmFeatures } from "../features/waterSleevesFeatures";
import type {
  WaterSleevesTrajectory,
  WaterSleevesTrajectorySample,
} from "../features/waterSleevesTrajectory";
import type { WaterSleevesReferenceEnvelope } from "./waterSleevesEnvelope";
import {
  evaluateWaterSleevesTrajectory,
  type EvaluatorTrackingStatus,
  type WaterSleevesEvaluation,
} from "./waterSleevesEvaluator";

export type WaterSleevesRegressionId =
  | "nominal-reference"
  | "slower-timing"
  | "faster-timing"
  | "conservative-noise"
  | "short-occlusion"
  | "prolonged-occlusion"
  | "reversed-sequence"
  | "displaced-arm-path";

export interface WaterSleevesRegressionExpectation {
  minimumScore?: number;
  maximumScore?: number;
  trackingStatus: EvaluatorTrackingStatus;
}

export interface WaterSleevesRegressionResult {
  id: WaterSleevesRegressionId;
  description: string;
  expectation: WaterSleevesRegressionExpectation;
  evaluation: WaterSleevesEvaluation;
  passed: boolean;
}

interface RegressionScenario {
  id: WaterSleevesRegressionId;
  description: string;
  expectation: WaterSleevesRegressionExpectation;
  transform: (source: WaterSleevesTrajectory) => WaterSleevesTrajectory;
}

const SCENARIOS: readonly RegressionScenario[] = [
  {
    id: "nominal-reference",
    description: "Reference-derived nominal trajectory",
    expectation: { minimumScore: 0.95, trackingStatus: "good" },
    transform: identity,
  },
  {
    id: "slower-timing",
    description: "Every frame repeated to simulate slower performance",
    expectation: { minimumScore: 0.95, trackingStatus: "good" },
    transform: duplicateFrames,
  },
  {
    id: "faster-timing",
    description: "Alternate frames removed to simulate faster performance",
    expectation: { minimumScore: 0.9, trackingStatus: "good" },
    transform: removeAlternateFrames,
  },
  {
    id: "conservative-noise",
    description: "Seeded small perturbations on arm angles and elbow positions",
    expectation: { minimumScore: 0.9, trackingStatus: "good" },
    transform: addConservativeNoise,
  },
  {
    id: "short-occlusion",
    description: "Both arms unavailable for five consecutive samples",
    expectation: { minimumScore: 0.8, trackingStatus: "good" },
    transform: (source) => occlude(source, 17, 21),
  },
  {
    id: "prolonged-occlusion",
    description: "Both arms unavailable through most of the attempt",
    expectation: { maximumScore: 0.5, trackingStatus: "insufficient" },
    transform: (source) => occlude(source, 6, 34),
  },
  {
    id: "reversed-sequence",
    description: "Movement samples performed in reverse order",
    expectation: { maximumScore: 0.7, trackingStatus: "good" },
    transform: reverseMovement,
  },
  {
    id: "displaced-arm-path",
    description: "Large deterministic angle and elbow-path displacement",
    expectation: { maximumScore: 0.5, trackingStatus: "good" },
    transform: displaceArmPath,
  },
];

export function runWaterSleevesRegressions(
  reference: WaterSleevesReferenceEnvelope,
): readonly WaterSleevesRegressionResult[] {
  const nominal = trajectoryFromReference(reference);
  return SCENARIOS.map((scenario) => {
    const evaluation = evaluateWaterSleevesTrajectory(
      scenario.transform(nominal),
      reference,
    );
    return {
      id: scenario.id,
      description: scenario.description,
      expectation: scenario.expectation,
      evaluation,
      passed: meetsExpectation(evaluation, scenario.expectation),
    };
  });
}

export function trajectoryFromReference(
  reference: WaterSleevesReferenceEnvelope,
): WaterSleevesTrajectory {
  const durationMs = 8000;
  const samples = reference.points.map((point) => ({
    offsetMs: Math.round(point.progress * durationMs),
    progress: point.progress,
    leftArm: armFromReference(
      point.leftUpperArmAngle?.target,
      point.leftElbowPosition?.target,
    ),
    rightArm: armFromReference(
      point.rightUpperArmAngle?.target,
      point.rightElbowPosition?.target,
    ),
  }));
  return trajectory("water-sleeves-regression-nominal", samples, durationMs);
}

function armFromReference(
  angle: number | undefined,
  elbow: { x: number; y: number } | undefined,
): WaterSleevesArmFeatures | null {
  if (angle === undefined || elbow === undefined) return null;
  return {
    upperArmAngleRad: angle,
    elbowFromShoulder: { ...elbow },
    elbowAngleRad: null,
    wristFromShoulder: null,
    confidence: 1,
  };
}

function identity(source: WaterSleevesTrajectory): WaterSleevesTrajectory {
  return source;
}

function duplicateFrames(source: WaterSleevesTrajectory): WaterSleevesTrajectory {
  return retime(
    source,
    source.samples.flatMap((sample) => [sample, sample]),
  );
}

function removeAlternateFrames(
  source: WaterSleevesTrajectory,
): WaterSleevesTrajectory {
  const samples = source.samples.filter(
    (_sample, index) => index % 2 === 0 || index === source.samples.length - 1,
  );
  return retime(source, samples);
}

function addConservativeNoise(
  source: WaterSleevesTrajectory,
): WaterSleevesTrajectory {
  let state = 0x6d2b79f5;
  const random = () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
  return mapArms(source, (arm) => ({
    ...arm,
    upperArmAngleRad: arm.upperArmAngleRad + (random() - 0.5) * 0.2,
    elbowFromShoulder: {
      x: arm.elbowFromShoulder.x + (random() - 0.5) * 0.16,
      y: arm.elbowFromShoulder.y + (random() - 0.5) * 0.16,
    },
  }));
}

function occlude(
  source: WaterSleevesTrajectory,
  start: number,
  end: number,
): WaterSleevesTrajectory {
  const samples = source.samples.map((sample, index) =>
    index >= start && index <= end
      ? { ...sample, leftArm: null, rightArm: null }
      : sample,
  );
  return trajectory(`${source.fixtureId}-occluded`, samples, source.durationMs);
}

function reverseMovement(source: WaterSleevesTrajectory): WaterSleevesTrajectory {
  const reversedArms = [...source.samples].reverse();
  const samples = source.samples.map((sample, index) => ({
    ...sample,
    leftArm: reversedArms[index]!.leftArm,
    rightArm: reversedArms[index]!.rightArm,
  }));
  return trajectory(`${source.fixtureId}-reversed`, samples, source.durationMs);
}

function displaceArmPath(source: WaterSleevesTrajectory): WaterSleevesTrajectory {
  return mapArms(source, (arm, side) => ({
    ...arm,
    upperArmAngleRad: arm.upperArmAngleRad + (side === "left" ? 1.2 : -1.2),
    elbowFromShoulder: {
      x: arm.elbowFromShoulder.x + 0.9,
      y: arm.elbowFromShoulder.y + 0.9,
    },
  }));
}

function mapArms(
  source: WaterSleevesTrajectory,
  transform: (
    arm: WaterSleevesArmFeatures,
    side: "left" | "right",
  ) => WaterSleevesArmFeatures,
): WaterSleevesTrajectory {
  const samples = source.samples.map((sample) => ({
    ...sample,
    leftArm: sample.leftArm ? transform(sample.leftArm, "left") : null,
    rightArm: sample.rightArm ? transform(sample.rightArm, "right") : null,
  }));
  return trajectory(`${source.fixtureId}-transformed`, samples, source.durationMs);
}

function retime(
  source: WaterSleevesTrajectory,
  samples: readonly WaterSleevesTrajectorySample[],
): WaterSleevesTrajectory {
  const durationMs = source.durationMs;
  const lastIndex = samples.length - 1;
  return trajectory(
    `${source.fixtureId}-retimed`,
    samples.map((sample, index) => ({
      ...sample,
      offsetMs: lastIndex > 0 ? Math.round((index / lastIndex) * durationMs) : 0,
      progress: lastIndex > 0 ? index / lastIndex : 0,
    })),
    durationMs,
  );
}

function trajectory(
  fixtureId: string,
  samples: readonly WaterSleevesTrajectorySample[],
  durationMs: number,
): WaterSleevesTrajectory {
  return {
    fixtureId,
    durationMs,
    totalFrames: samples.length,
    usableFrames: samples.filter(
      (sample) => sample.leftArm !== null || sample.rightArm !== null,
    ).length,
    samples,
    signals: [],
  };
}

function meetsExpectation(
  evaluation: WaterSleevesEvaluation,
  expectation: WaterSleevesRegressionExpectation,
): boolean {
  return (
    (expectation.minimumScore === undefined ||
      evaluation.overallScore >= expectation.minimumScore) &&
    (expectation.maximumScore === undefined ||
      evaluation.overallScore <= expectation.maximumScore) &&
    evaluation.trackingStatus === expectation.trackingStatus
  );
}
