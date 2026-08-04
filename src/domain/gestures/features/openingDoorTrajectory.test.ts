import { describe, expect, it } from "vitest";
import type { OpeningDoorFrameFeatures } from "./openingDoorFeatures";
import {
  createOpeningDoorTrajectory,
  type OpeningDoorTrajectorySample,
} from "./openingDoorTrajectory";

describe("createOpeningDoorTrajectory", () => {
  it("normalizes progress and reports pose and hand coverage separately", () => {
    const trajectory = createOpeningDoorTrajectory(
      "opening-door-test",
      [sample(0, true), sample(500, true), sample(1000, false)],
      1000,
    );

    expect(trajectory.samples.map((item) => item.progress)).toEqual([0, 0.5, 1]);
    expect(trajectory.usablePoseFrames).toBe(3);
    expect(trajectory.usableHandFrames).toBe(2);
    expect(signal(trajectory, "leftElbowPosition")).toMatchObject({
      coverage: 1,
      recommendedUse: "required",
    });
    expect(signal(trajectory, "leftPalmPosition")).toMatchObject({
      coverage: 2 / 3,
      recommendedUse: "optional",
    });
  });

  it("excludes sparsely available optional hand signals", () => {
    const trajectory = createOpeningDoorTrajectory(
      "sparse-hands",
      [sample(0, true), sample(500, false), sample(1000, false)],
      1000,
    );

    expect(signal(trajectory, "rightHandOpenness")?.recommendedUse).toBe("excluded");
  });
});

function signal(
  trajectory: ReturnType<typeof createOpeningDoorTrajectory>,
  name: string,
) {
  return trajectory.signals.find((assessment) => assessment.signal === name);
}

function sample(offsetMs: number, hands: boolean): OpeningDoorTrajectorySample {
  const arm: NonNullable<OpeningDoorFrameFeatures["leftArm"]> = {
    elbowFromShoulder: { x: offsetMs / 1000, y: 0.5 },
    wristFromShoulder: { x: offsetMs / 1000, y: 1 },
    elbowAngleRad: 1,
    confidence: 0.9,
  };
  const hand: NonNullable<OpeningDoorFrameFeatures["leftHand"]> = {
    palmCenterFromBody: { x: offsetMs / 1000, y: 0.3 },
    palmDirectionRad: 1.2,
    openness: 2,
    confidence: 0.9,
  };
  return {
    offsetMs,
    progress: offsetMs / 1000,
    leftArm: arm,
    rightArm: arm,
    leftHand: hands ? hand : null,
    rightHand: hands ? hand : null,
  };
}
