import { describe, expect, it } from "vitest";
import type {
  OpeningDoorArmFeatures,
  OpeningDoorHandFeatures,
} from "../features/openingDoorFeatures";
import {
  createOpeningDoorTrajectory,
  type OpeningDoorTrajectorySample,
} from "../features/openingDoorTrajectory";
import { OPENING_DOOR_REFERENCE } from "../references/openingDoorReference";
import { evaluateOpeningDoorTrajectory } from "./openingDoorEvaluator";

describe("evaluateOpeningDoorTrajectory", () => {
  it("scores the canonical two-take reference trajectory highly", () => {
    const evaluation = evaluateOpeningDoorTrajectory(
      referenceTrajectory(),
      OPENING_DOOR_REFERENCE,
    );

    expect(evaluation.overallScore).toBeGreaterThan(0.98);
    expect(evaluation.trackingStatus).toBe("good");
    expect(evaluation.alignedPairs).toBeGreaterThan(0);
  });

  it("aligns a slower sampling of the same movement", () => {
    const source = referenceSamples();
    const stretched = source.flatMap((sample, index) =>
      index === 0 ? [sample] : [sample, { ...sample }],
    );
    const evaluation = evaluateOpeningDoorTrajectory(
      createOpeningDoorTrajectory("stretched", stretched, 8000),
      OPENING_DOOR_REFERENCE,
    );

    expect(evaluation.overallScore).toBeGreaterThan(0.9);
    expect(evaluation.trackingStatus).toBe("good");
  });

  it("keeps a strong pose score when optional hand tracking is absent", () => {
    const samples = referenceSamples().map((sample) => ({
      ...sample,
      leftHand: null,
      rightHand: null,
    }));
    const evaluation = evaluateOpeningDoorTrajectory(
      createOpeningDoorTrajectory("pose-only", samples),
      OPENING_DOOR_REFERENCE,
    );

    expect(evaluation.overallScore).toBeGreaterThan(0.98);
    expect(evaluation.signalScores.leftPalmPosition.score).toBeNull();
    expect(evaluation.trackingStatus).toBe("good");
  });

  it("penalizes a fully tracked but spatially displaced arm path", () => {
    const samples = referenceSamples().map((sample) => ({
      ...sample,
      leftArm: displace(sample.leftArm, 2),
      rightArm: displace(sample.rightArm, -2),
      leftHand: null,
      rightHand: null,
    }));
    const evaluation = evaluateOpeningDoorTrajectory(
      createOpeningDoorTrajectory("displaced", samples),
      OPENING_DOOR_REFERENCE,
    );

    expect(evaluation.overallScore).toBeLessThan(0.2);
    expect(evaluation.trackingStatus).toBe("good");
  });

  it("rejects a stationary pose even when it resembles the reference", () => {
    const source = referenceTrajectory();
    const held = source.samples.map((sample) => ({
      ...sample,
      leftArm: source.samples[0]!.leftArm,
      rightArm: source.samples[0]!.rightArm,
      leftHand: source.samples[0]!.leftHand,
      rightHand: source.samples[0]!.rightHand,
    }));
    const evaluation = evaluateOpeningDoorTrajectory(
      createOpeningDoorTrajectory("stationary", held),
      OPENING_DOOR_REFERENCE,
    );

    expect(evaluation.movementCompleteness).toBe(0);
    expect(evaluation.overallScore).toBe(0);
    expect(evaluation.trackingStatus).toBe("good");
  });

  it("penalizes a substantially reduced arm-path range", () => {
    const source = referenceTrajectory();
    const reduced = scaleMovement(source.samples, 0.35);
    const evaluation = evaluateOpeningDoorTrajectory(
      createOpeningDoorTrajectory("reduced-range", reduced),
      OPENING_DOOR_REFERENCE,
    );

    expect(evaluation.movementCompleteness).toBeLessThan(0.5);
    expect(evaluation.overallScore).toBeLessThan(0.5);
  });

  it("marks missing required pose signals as insufficient", () => {
    const samples = referenceSamples().map((sample) => ({
      ...sample,
      leftArm: null,
      rightArm: null,
    }));
    const evaluation = evaluateOpeningDoorTrajectory(
      createOpeningDoorTrajectory("missing-pose", samples),
      OPENING_DOOR_REFERENCE,
    );

    expect(evaluation.overallScore).toBe(0);
    expect(evaluation.trackingStatus).toBe("insufficient");
  });
});

function referenceTrajectory() {
  return createOpeningDoorTrajectory("canonical", referenceSamples(), 8000);
}

function referenceSamples(): OpeningDoorTrajectorySample[] {
  return OPENING_DOOR_REFERENCE.points.map((point, index) => ({
    offsetMs: index * 200,
    progress: point.progress,
    leftArm: arm(point.leftElbowPosition?.target, point.leftWristPosition?.target),
    rightArm: arm(point.rightElbowPosition?.target, point.rightWristPosition?.target),
    leftHand: hand(
      point.leftPalmPosition?.target,
      point.leftPalmDirection?.target,
      point.leftHandOpenness?.target,
    ),
    rightHand: hand(
      point.rightPalmPosition?.target,
      point.rightPalmDirection?.target,
      point.rightHandOpenness?.target,
    ),
  }));
}

function arm(
  elbow: { x: number; y: number } | undefined,
  wrist: { x: number; y: number } | undefined,
): OpeningDoorArmFeatures | null {
  return elbow ? {
    elbowFromShoulder: elbow,
    wristFromShoulder: wrist ?? null,
    elbowAngleRad: null,
    confidence: 1,
  } : null;
}

function hand(
  position: { x: number; y: number } | undefined,
  direction: number | undefined,
  openness: number | undefined,
): OpeningDoorHandFeatures | null {
  return position && direction !== undefined && openness !== undefined ? {
    palmCenterFromBody: position,
    palmDirectionRad: direction,
    openness,
    confidence: 1,
  } : null;
}

function displace(
  armFeatures: OpeningDoorArmFeatures | null,
  amount: number,
): OpeningDoorArmFeatures | null {
  if (!armFeatures) return null;
  return {
    ...armFeatures,
    elbowFromShoulder: {
      x: armFeatures.elbowFromShoulder.x + amount,
      y: armFeatures.elbowFromShoulder.y,
    },
    wristFromShoulder: armFeatures.wristFromShoulder ? {
      x: armFeatures.wristFromShoulder.x + amount,
      y: armFeatures.wristFromShoulder.y,
    } : null,
  };
}

function scaleMovement(
  samples: readonly OpeningDoorTrajectorySample[],
  scale: number,
): OpeningDoorTrajectorySample[] {
  const origin = samples[0]!;
  return samples.map((sample) => ({
    ...sample,
    leftArm: scaleArm(sample.leftArm, origin.leftArm, scale),
    rightArm: scaleArm(sample.rightArm, origin.rightArm, scale),
    leftHand: null,
    rightHand: null,
  }));
}

function scaleArm(
  armFeatures: OpeningDoorArmFeatures | null,
  origin: OpeningDoorArmFeatures | null,
  scale: number,
): OpeningDoorArmFeatures | null {
  if (!armFeatures || !origin) return null;
  const scalePoint = (
    point: { x: number; y: number },
    start: { x: number; y: number },
  ) => ({
    x: start.x + (point.x - start.x) * scale,
    y: start.y + (point.y - start.y) * scale,
  });
  return {
    ...armFeatures,
    elbowFromShoulder: scalePoint(
      armFeatures.elbowFromShoulder,
      origin.elbowFromShoulder,
    ),
    wristFromShoulder:
      armFeatures.wristFromShoulder && origin.wristFromShoulder
        ? scalePoint(armFeatures.wristFromShoulder, origin.wristFromShoulder)
        : null,
  };
}
