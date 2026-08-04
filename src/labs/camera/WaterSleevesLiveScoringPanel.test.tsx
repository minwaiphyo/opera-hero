import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { WaterSleevesLiveScoringState } from "./useWaterSleevesLiveScoring";
import { WaterSleevesLiveScoringPanel } from "./WaterSleevesLiveScoringPanel";

afterEach(cleanup);

describe("WaterSleevesLiveScoringPanel", () => {
  it("requires the camera before an attempt can start", () => {
    renderPanel(idleState(), false);

    expect(screen.getByRole("button", { name: "Start attempt" })).toBeDisabled();
    expect(screen.getByText(/Start the camera/)).toBeInTheDocument();
  });

  it("exposes recording controls and live buffer diagnostics", () => {
    const onFinish = vi.fn();
    renderPanel({
      snapshot: {
        attemptId: "test-1",
        status: "recording",
        tracking: "tracked",
        bufferedSamples: 18,
        usableSamples: 17,
        elapsedMs: 1200,
      },
      evaluation: null,
      hasCompletedTrajectory: false,
      capturePhase: "recording",
      countdownRemainingMs: 0,
    }, true, { onFinish });

    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Manual finish" }));
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("renders a diagnostic score without declaring a pass threshold", () => {
    renderPanel({
      snapshot: {
        attemptId: "test-2",
        status: "completed",
        tracking: "tracked",
        bufferedSamples: 40,
        usableSamples: 38,
        elapsedMs: 4200,
      },
      evaluation: {
        overallScore: 0.825,
        trackingCoverage: 0.95,
        trackingStatus: "good",
        alignedPairs: 44,
        signalScores: {
          leftUpperArmAngle: { score: 0.8, coverage: 1 },
          rightUpperArmAngle: { score: 0.9, coverage: 1 },
          leftElbowPosition: { score: 0.75, coverage: 0.9 },
          rightElbowPosition: { score: 0.85, coverage: 0.9 },
        },
      },
      hasCompletedTrajectory: true,
      capturePhase: "completed",
      countdownRemainingMs: 0,
    }, true);

    expect(screen.getByText("82.5%")).toBeInTheDocument();
    expect(screen.getByText(/No visitor pass threshold/)).toBeInTheDocument();
    expect(screen.getByText("good")).toBeInTheDocument();
  });
});

function idleState(): WaterSleevesLiveScoringState {
  return {
    snapshot: {
      attemptId: null,
      status: "idle",
      tracking: "awaiting",
      bufferedSamples: 0,
      usableSamples: 0,
      elapsedMs: 0,
    },
    evaluation: null,
    hasCompletedTrajectory: false,
    capturePhase: "idle",
    countdownRemainingMs: 0,
  };
}

function renderPanel(
  state: WaterSleevesLiveScoringState,
  cameraActive: boolean,
  overrides: Partial<{
    onStart: () => void;
    onFinish: () => void;
    onCancel: () => void;
    onReset: () => void;
  }> = {},
) {
  return render(
    <WaterSleevesLiveScoringPanel
      cameraActive={cameraActive}
      onCancel={overrides.onCancel ?? vi.fn()}
      onFinish={overrides.onFinish ?? vi.fn()}
      onReset={overrides.onReset ?? vi.fn()}
      onStart={overrides.onStart ?? vi.fn()}
      state={state}
    />,
  );
}
