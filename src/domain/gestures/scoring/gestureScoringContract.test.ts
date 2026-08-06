import { describe, expect, it } from "vitest";
import {
  GESTURE_DEFINITIONS,
  GESTURE_IDS,
  getGestureDefinition,
  type GestureEvaluation,
  type GestureScorer,
} from "./gestureScoringContract";

describe("gestureScoringContract", () => {
  it("defines the three festival gestures in level order", () => {
    expect(GESTURE_DEFINITIONS).toEqual([
      { id: "orchid-finger", level: 1, displayName: "Orchid Finger" },
      { id: "opening-door", level: 2, displayName: "Opening Door" },
      { id: "water-sleeves", level: 3, displayName: "Water Sleeves" },
    ]);
    expect(GESTURE_IDS).toHaveLength(3);
    expect(new Set(GESTURE_IDS).size).toBe(GESTURE_IDS.length);
  });

  it("looks up canonical metadata by typed gesture id", () => {
    expect(getGestureDefinition("opening-door")).toMatchObject({
      level: 2,
      displayName: "Opening Door",
    });
  });

  it("supports a gesture-independent evaluator shape", () => {
    type Signal = "leftArm" | "rightArm";
    const evaluation: GestureEvaluation<Signal> = {
      overallScore: 0.8,
      trackingCoverage: 0.9,
      trackingStatus: "good",
      alignedPairs: 12,
      signalScores: {
        leftArm: { score: 0.75, coverage: 1 },
        rightArm: { score: 0.85, coverage: 0.8 },
      },
    };
    const scorer: GestureScorer<readonly number[], Signal> = {
      gestureId: "opening-door",
      evaluate: () => evaluation,
    };

    expect(scorer.evaluate([])).toBe(evaluation);
  });
});
