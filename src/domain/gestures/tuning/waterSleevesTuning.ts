import type {
  EvaluatorTrackingStatus,
  WaterSleevesEvaluation,
} from "../scoring/waterSleevesEvaluator";

export type WaterSleevesAttemptLabel = "correct" | "partial" | "incorrect";

export interface WaterSleevesTuningObservation {
  attemptId: string;
  label: WaterSleevesAttemptLabel;
  score: number;
  trackingCoverage: number;
  trackingStatus: EvaluatorTrackingStatus;
}

export interface TuningRange {
  count: number;
  minimum: number | null;
  maximum: number | null;
  mean: number | null;
}

export interface WaterSleevesTuningSummary {
  ranges: Record<WaterSleevesAttemptLabel, TuningRange>;
  usableObservations: number;
  separation: "insufficient-data" | "separated" | "overlap";
  candidateThreshold: number | null;
  thresholdReady: boolean;
}

export const WATER_SLEEVES_MINIMUM_TUNING_SAMPLES_PER_CLASS = 3;

export function createWaterSleevesTuningObservation(
  attemptId: string,
  label: WaterSleevesAttemptLabel,
  evaluation: WaterSleevesEvaluation,
): WaterSleevesTuningObservation {
  if (!attemptId.trim()) throw new Error("attemptId must not be empty.");
  return {
    attemptId,
    label,
    score: evaluation.overallScore,
    trackingCoverage: evaluation.trackingCoverage,
    trackingStatus: evaluation.trackingStatus,
  };
}

export function analyzeWaterSleevesTuning(
  observations: readonly WaterSleevesTuningObservation[],
): WaterSleevesTuningSummary {
  const usable = observations.filter(
    (observation) => observation.trackingStatus !== "insufficient",
  );
  const ranges = {
    correct: range(usable, "correct"),
    partial: range(usable, "partial"),
    incorrect: range(usable, "incorrect"),
  };
  const correctMinimum = ranges.correct.minimum;
  const incorrectMaximum = ranges.incorrect.maximum;
  const hasBothClasses = correctMinimum !== null && incorrectMaximum !== null;
  const separated = hasBothClasses && incorrectMaximum < correctMinimum;
  const candidateThreshold = separated
    ? (incorrectMaximum + correctMinimum) / 2
    : null;

  return {
    ranges,
    usableObservations: usable.length,
    separation: !hasBothClasses
      ? "insufficient-data"
      : separated
        ? "separated"
        : "overlap",
    candidateThreshold,
    thresholdReady: Boolean(
      separated &&
        ranges.correct.count >= WATER_SLEEVES_MINIMUM_TUNING_SAMPLES_PER_CLASS &&
        ranges.incorrect.count >= WATER_SLEEVES_MINIMUM_TUNING_SAMPLES_PER_CLASS,
    ),
  };
}

function range(
  observations: readonly WaterSleevesTuningObservation[],
  label: WaterSleevesAttemptLabel,
): TuningRange {
  const scores = observations
    .filter((observation) => observation.label === label)
    .map((observation) => observation.score);
  if (scores.length === 0) {
    return { count: 0, minimum: null, maximum: null, mean: null };
  }
  return {
    count: scores.length,
    minimum: Math.min(...scores),
    maximum: Math.max(...scores),
    mean: scores.reduce((sum, score) => sum + score, 0) / scores.length,
  };
}
