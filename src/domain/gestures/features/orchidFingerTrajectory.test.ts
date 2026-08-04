import { describe, expect, it } from "vitest";
import type { OrchidFingerArmFeatures, OrchidFingerHandFeatures } from "./orchidFingerFeatures";
import { createOrchidFingerTrajectory, type OrchidFingerTrajectorySample } from "./orchidFingerTrajectory";

describe("createOrchidFingerTrajectory", () => {
  it("reports body and hand coverage independently", () => {
    const trajectory = createOrchidFingerTrajectory("orchid-test", [sample(0, true), sample(500, true), sample(1000, false)], 1000);
    expect(trajectory.samples.map(({ progress }) => progress)).toEqual([0, 0.5, 1]);
    expect(trajectory.usablePoseFrames).toBe(3);
    expect(trajectory.usableHandFrames).toBe(2);
    expect(signal(trajectory, "leftArmPlacement")).toMatchObject({ coverage: 1, recommendedUse: "required" });
    expect(signal(trajectory, "leftHandShape")).toMatchObject({ coverage: 2 / 3, recommendedUse: "optional" });
  });

  it("excludes sparse hand evidence", () => {
    const trajectory = createOrchidFingerTrajectory("sparse", [sample(0, true), sample(500, false), sample(1000, false)], 1000);
    expect(signal(trajectory, "rightHandShape")?.recommendedUse).toBe("excluded");
  });
});

function signal(trajectory: ReturnType<typeof createOrchidFingerTrajectory>, name: string) {
  return trajectory.signals.find(({ signal }) => signal === name);
}

function sample(offsetMs: number, hands: boolean): OrchidFingerTrajectorySample {
  const arm: OrchidFingerArmFeatures = { elbowFromShoulder: { x: offsetMs / 1000, y: 0.5 }, wristFromShoulder: { x: offsetMs / 1000, y: 1 }, elbowAngleRad: 1, confidence: 0.9 };
  const hand: OrchidFingerHandFeatures = {
    palmCenterFromBody: { x: offsetMs / 1000, y: 0.3 }, palmDirectionRad: 1.2,
    fingerExtension: { thumb: 1, index: 2, middle: 2, ring: 1, pinky: 1 },
    fingerCurlRad: { index: 2, middle: 2, ring: 1, pinky: 1 },
    thumbToFingertip: { index: 1, middle: 1, ring: 0.2, pinky: 0.5 }, confidence: 0.9,
  };
  return { offsetMs, progress: offsetMs / 1000, leftArm: arm, rightArm: arm, leftHand: hands ? hand : null, rightHand: hands ? hand : null };
}
