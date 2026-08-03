import { describe, expect, it } from "vitest";
import type { VisionReplayFixture } from "../../../vision/replay/visionReplayTypes";
import type { VisionLandmark } from "../../../vision/visionTypes";
import { extractWaterSleevesTrajectory } from "./waterSleevesTrajectory";

describe("extractWaterSleevesTrajectory", () => {
  it("normalizes time and measures feature coverage", () => {
    const trajectory = extractWaterSleevesTrajectory(
      fixture([pose(), pose({ leftWristVisibility: 0.1 }), undefined]),
    );

    expect(trajectory.samples.map((sample) => sample.progress)).toEqual([
      0, 0.5, 1,
    ]);
    expect(trajectory.usableFrames).toBe(2);
    expect(signal(trajectory, "leftUpperArmAngle")).toMatchObject({
      coverage: 2 / 3,
      recommendedUse: "optional",
    });
    expect(signal(trajectory, "leftWristPosition")).toMatchObject({
      coverage: 1 / 3,
      recommendedUse: "excluded",
    });
  });

  it("allows stable core signals to be required", () => {
    const trajectory = extractWaterSleevesTrajectory(
      fixture(Array.from({ length: 10 }, () => pose())),
    );

    expect(signal(trajectory, "leftUpperArmAngle").recommendedUse).toBe(
      "required",
    );
    expect(signal(trajectory, "rightElbowPosition").recommendedUse).toBe(
      "required",
    );
  });

  it("never recommends wrist or elbow-angle signals as required", () => {
    const trajectory = extractWaterSleevesTrajectory(
      fixture(Array.from({ length: 10 }, () => pose())),
    );

    expect(signal(trajectory, "leftWristPosition")).toMatchObject({
      coverage: 1,
      recommendedUse: "optional",
    });
    expect(signal(trajectory, "rightElbowAngle").recommendedUse).toBe(
      "optional",
    );
  });
});

function signal(
  trajectory: ReturnType<typeof extractWaterSleevesTrajectory>,
  name: string,
) {
  return trajectory.signals.find((candidate) => candidate.signal === name)!;
}

function fixture(
  poses: Array<ReturnType<typeof pose> | undefined>,
): VisionReplayFixture {
  return {
    schemaVersion: 1,
    id: "water-sleeves-test",
    description: "test",
    source: "synthetic",
    containsRecordedImagery: false,
    frames: poses.map((candidate, index) => ({
      offsetMs: index * 100,
      pose: candidate,
      hands: [],
    })),
  };
}

function pose(options: { leftWristVisibility?: number } = {}) {
  const landmarks = Array.from({ length: 33 }, () => point(0, 0, 0));
  landmarks[11] = point(0.4, 0.3);
  landmarks[12] = point(0.6, 0.3);
  landmarks[13] = point(0.3, 0.45);
  landmarks[14] = point(0.7, 0.45);
  landmarks[15] = point(0.25, 0.6, options.leftWristVisibility);
  landmarks[16] = point(0.75, 0.6);
  return { landmarks, worldLandmarks: landmarks };
}

function point(x: number, y: number, visibility = 0.9): VisionLandmark {
  return { x, y, z: 0, visibility };
}
