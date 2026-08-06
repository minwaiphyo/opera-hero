import { describe, expect, it } from "vitest";
import type { WaterSleevesEvaluation } from "../scoring/waterSleevesEvaluator";
import {
  analyzeWaterSleevesTuning,
  createWaterSleevesTuningObservation,
  type WaterSleevesAttemptLabel,
} from "./waterSleevesTuning";

describe("Water Sleeves tuning analysis", () => {
  it("requires both correct and incorrect observations", () => {
    expect(analyzeWaterSleevesTuning([observation("c1", "correct", 0.8)])).toMatchObject({
      separation: "insufficient-data",
      candidateThreshold: null,
      thresholdReady: false,
    });
  });

  it("proposes a midpoint only after three separated samples per class", () => {
    const summary = analyzeWaterSleevesTuning([
      observation("c1", "correct", 0.8),
      observation("c2", "correct", 0.9),
      observation("c3", "correct", 0.85),
      observation("i1", "incorrect", 0.3),
      observation("i2", "incorrect", 0.4),
      observation("i3", "incorrect", 0.5),
    ]);

    expect(summary.separation).toBe("separated");
    expect(summary.candidateThreshold).toBeCloseTo(0.65);
    expect(summary.thresholdReady).toBe(true);
  });

  it("reports overlap and excludes insufficient-tracking attempts", () => {
    const summary = analyzeWaterSleevesTuning([
      observation("c1", "correct", 0.6),
      observation("i1", "incorrect", 0.7),
      { ...observation("i2", "incorrect", 0.2), trackingStatus: "insufficient" },
    ]);

    expect(summary).toMatchObject({
      usableObservations: 2,
      separation: "overlap",
      candidateThreshold: null,
    });
    expect(summary.ranges.incorrect.count).toBe(1);
  });
});

function observation(
  attemptId: string,
  label: WaterSleevesAttemptLabel,
  score: number,
) {
  return createWaterSleevesTuningObservation(attemptId, label, evaluation(score));
}

function evaluation(overallScore: number): WaterSleevesEvaluation {
  return {
    overallScore,
    movementCompleteness: 1,
    trackingCoverage: 0.9,
    trackingStatus: "good",
    alignedPairs: 40,
    signalScores: {
      leftUpperArmAngle: { score: overallScore, coverage: 1 },
      rightUpperArmAngle: { score: overallScore, coverage: 1 },
      leftElbowPosition: { score: overallScore, coverage: 1 },
      rightElbowPosition: { score: overallScore, coverage: 1 },
    },
  };
}
