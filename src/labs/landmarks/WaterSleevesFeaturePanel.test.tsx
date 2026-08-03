import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type {
  VisionLandmark,
  VisionLandmarkFrame,
} from "../../vision/visionTypes";
import type { VisionReplayFixture } from "../../vision/replay/visionReplayTypes";
import { WaterSleevesFeaturePanel } from "./WaterSleevesFeaturePanel";

describe("WaterSleevesFeaturePanel", () => {
  afterEach(cleanup);

  it("explains the pose-only policy before replay", () => {
    render(<WaterSleevesFeaturePanel fixture={fixture()} frame={null} />);

    expect(screen.getByText(/Hand Landmarker detections are ignored/)).toBeInTheDocument();
    expect(screen.getByText(/Start the replay/)).toBeInTheDocument();
  });

  it("shows usable arm measurements without hand detections", () => {
    render(<WaterSleevesFeaturePanel fixture={fixture()} frame={poseFrame()} />);

    expect(screen.getByText("2/2")).toBeInTheDocument();
    expect(screen.getByText("none")).toBeInTheDocument();
    expect(screen.getByText(/41 smoothed progress points/)).toBeInTheDocument();
    expect(screen.getByText(/not yet a visitor pass score/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Deterministic regressions" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("pass")).toHaveLength(8);
    expect(
      within(screen.getByRole("region", { name: "Left arm" })).getByText(
        "usable",
      ),
    ).toBeInTheDocument();
  });

  it("marks wrist-dependent features as occluded without discarding the arm", () => {
    render(
      <WaterSleevesFeaturePanel fixture={fixture()} frame={poseFrame(0.1)} />,
    );

    const left = within(screen.getByRole("region", { name: "Left arm" }));
    expect(left.getByText("usable")).toBeInTheDocument();
    expect(left.getAllByText("occluded")).toHaveLength(2);
  });
});

function fixture(): VisionReplayFixture {
  const frame = poseFrame();
  return {
    schemaVersion: 1,
    id: "water-sleeves-test",
    description: "test",
    source: "synthetic",
    containsRecordedImagery: false,
    frames: [
      { offsetMs: 0, pose: frame.pose, hands: [] },
      { offsetMs: 50, pose: frame.pose, hands: [] },
    ],
  };
}

function poseFrame(leftWristVisibility = 0.9): VisionLandmarkFrame {
  const landmarks = Array.from({ length: 33 }, () => point(0, 0, 0));
  landmarks[11] = point(0.4, 0.3);
  landmarks[12] = point(0.6, 0.3);
  landmarks[13] = point(0.3, 0.45);
  landmarks[14] = point(0.7, 0.45);
  landmarks[15] = point(0.25, 0.6, leftWristVisibility);
  landmarks[16] = point(0.75, 0.6);
  return {
    frameId: 1,
    capturedAtMs: 100,
    completedAtMs: 110,
    pose: { landmarks, worldLandmarks: landmarks },
    hands: [],
    timing: { poseMs: 5, handsMs: 0, totalMs: 5 },
  };
}

function point(x: number, y: number, visibility = 0.9): VisionLandmark {
  return { x, y, z: 0, visibility };
}
