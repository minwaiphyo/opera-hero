import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { VisionDiagnosticsSnapshot } from "../../vision/visionDiagnostics";
import { VisionDiagnosticsPanel } from "./VisionDiagnosticsPanel";

const diagnostics: VisionDiagnosticsSnapshot = {
  completedFrames: 84,
  effectiveFps: 24.75,
  latestInferenceMs: 31.25,
  inferenceP50Ms: 28.5,
  inferenceP95Ms: 46.75,
  captureToResultP50Ms: 36,
  captureToResultP95Ms: 61.5,
  submittedFrames: 100,
  sentFrames: 86,
  replacedFrames: 14,
  rejectedFrames: 0,
  replacementRate: 0.14,
  inFlight: true,
  pending: false,
  presence: true,
  framing: "good",
  trackingQuality: 0.91,
  trackingBand: "good",
  poseVisibility: 0.94,
  inFrameCoverage: 0.89,
  handsDetected: 2,
  upperBodyScale: 0.43,
};

describe("VisionDiagnosticsPanel", () => {
  it("renders worker metadata, latency, throughput, and backpressure", () => {
    render(
      <VisionDiagnosticsPanel
        diagnostics={diagnostics}
        worker={{
          status: "tracking",
          delegate: "GPU",
          poseModel: "lite",
          runtimeVersion: "1.0.0",
        }}
      />,
    );

    const panel = screen.getByRole("complementary", {
        name: "Vision worker diagnostics",
      });
    expect(panel).toBeInTheDocument();
    const disclosure = panel.querySelector("details")!;
    expect(disclosure).not.toHaveAttribute("open");
    expect(screen.getAllByText("24.8 FPS")).toHaveLength(2);
    fireEvent.click(panel.querySelector("summary")!);
    expect(disclosure).toHaveAttribute("open");
    expect(screen.getByText("MediaPipe 1.0.0")).toBeInTheDocument();
    expect(screen.getByText("GPU · Pose lite")).toBeInTheDocument();
    expect(screen.getByText("Aspect-fit · max 640 px")).toBeInTheDocument();
    expect(screen.getByText("present · good")).toBeInTheDocument();
    expect(screen.getByText("91.0% · good")).toBeInTheDocument();
    expect(screen.getByText("94.0%")).toBeInTheDocument();
    expect(screen.getByText("2/2 · 89.0%")).toBeInTheDocument();
    expect(screen.getByText("0.430")).toBeInTheDocument();
    expect(screen.getByText("31.3 ms latest")).toBeInTheDocument();
    expect(screen.getByText("28.5 ms / 46.8 ms")).toBeInTheDocument();
    expect(screen.getByText("36.0 ms / 61.5 ms")).toBeInTheDocument();
    expect(screen.getByText("84 completed / 100 submitted")).toBeInTheDocument();
    expect(screen.getByText("14 replaced · 14.0%")).toBeInTheDocument();
    expect(screen.getByText("1 active · none pending")).toBeInTheDocument();
  });
});
