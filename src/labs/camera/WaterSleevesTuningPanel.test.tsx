import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { WaterSleevesEvaluation } from "../../domain/gestures/scoring/waterSleevesEvaluator";
import { WaterSleevesTuningPanel } from "./WaterSleevesTuningPanel";

afterEach(cleanup);

describe("WaterSleevesTuningPanel", () => {
  it("records and relabels the latest scored attempt without persistence", () => {
    render(<WaterSleevesTuningPanel attemptId="attempt-1" evaluation={evaluation()} />);

    fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    expect(screen.getByText("1 attempts")).toBeInTheDocument();
    expect(screen.getByText("82.0%–82.0%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Partial" }));
    expect(screen.getAllByText("1 attempts")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Partial" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("does not allow labels before a score exists", () => {
    render(<WaterSleevesTuningPanel attemptId={null} evaluation={null} />);
    expect(screen.getByRole("button", { name: "Correct" })).toBeDisabled();
    expect(screen.getByText("More observations required")).toBeInTheDocument();
  });
});

function evaluation(): WaterSleevesEvaluation {
  return {
    overallScore: 0.82,
    movementCompleteness: 1,
    trackingCoverage: 0.9,
    trackingStatus: "good",
    alignedPairs: 40,
    signalScores: {
      leftUpperArmAngle: { score: 0.8, coverage: 1 },
      rightUpperArmAngle: { score: 0.84, coverage: 1 },
      leftElbowPosition: { score: 0.81, coverage: 1 },
      rightElbowPosition: { score: 0.83, coverage: 1 },
    },
  };
}
