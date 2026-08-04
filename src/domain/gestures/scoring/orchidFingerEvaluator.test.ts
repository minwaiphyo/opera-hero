import { describe, expect, it } from "vitest";
import type { OrchidFingerArmFeatures, OrchidFingerHandFeatures } from "../features/orchidFingerFeatures";
import { createOrchidFingerTrajectory, type OrchidFingerTrajectorySample } from "../features/orchidFingerTrajectory";
import { ORCHID_FINGER_REFERENCE } from "../references/orchidFingerReference";
import { evaluateOrchidFingerTrajectory } from "./orchidFingerEvaluator";

describe("evaluateOrchidFingerTrajectory", () => {
  it("scores the canonical multi-take reference highly", () => {
    const evaluation = evaluateOrchidFingerTrajectory(referenceTrajectory(), ORCHID_FINGER_REFERENCE);
    expect(evaluation.overallScore).toBeGreaterThan(0.98);
    expect(evaluation.trackingStatus).toBe("good");
    expect(evaluation.signalScores.leftHandShape.score).toBeGreaterThan(0.98);
  });

  it("uses dynamic time warping to align a slower sampling", () => {
    const stretched = referenceSamples().flatMap((sample, index) => index ? [sample, { ...sample }] : [sample]);
    const evaluation = evaluateOrchidFingerTrajectory(createOrchidFingerTrajectory("stretched", stretched, 8000), ORCHID_FINGER_REFERENCE);
    expect(evaluation.overallScore).toBeGreaterThan(0.9);
  });

  it("reports missing hand evidence without treating it as incorrect pose", () => {
    const samples = referenceSamples().map((sample) => ({ ...sample, leftHand: null, rightHand: null }));
    const evaluation = evaluateOrchidFingerTrajectory(createOrchidFingerTrajectory("pose-only", samples), ORCHID_FINGER_REFERENCE);
    expect(evaluation.overallScore).toBeGreaterThan(0.98);
    expect(evaluation.signalScores.leftHandShape).toEqual({ score: null, coverage: 0 });
    expect(evaluation.trackingStatus).toBe("good");
  });

  it("penalizes a visible but incorrect finger shape", () => {
    const samples = referenceSamples().map((sample) => ({ ...sample, leftHand: distort(sample.leftHand), rightHand: distort(sample.rightHand) }));
    const evaluation = evaluateOrchidFingerTrajectory(createOrchidFingerTrajectory("wrong-shape", samples), ORCHID_FINGER_REFERENCE);
    expect(evaluation.signalScores.leftHandShape.score).toBeLessThan(0.05);
    expect(evaluation.overallScore).toBeLessThan(0.75);
  });

  it("marks missing required body tracking as insufficient", () => {
    const samples = referenceSamples().map((sample) => ({ ...sample, leftArm: null, rightArm: null }));
    const evaluation = evaluateOrchidFingerTrajectory(createOrchidFingerTrajectory("missing-pose", samples), ORCHID_FINGER_REFERENCE);
    expect(evaluation.overallScore).toBe(0);
    expect(evaluation.trackingStatus).toBe("insufficient");
  });
});

function referenceTrajectory() { return createOrchidFingerTrajectory("canonical", referenceSamples(), 8000); }
function referenceSamples(): OrchidFingerTrajectorySample[] {
  return ORCHID_FINGER_REFERENCE.points.map((point, index) => ({
    offsetMs: index * 200, progress: point.progress,
    leftArm: arm(point.leftElbowPosition?.target, point.leftWristPosition?.target), rightArm: arm(point.rightElbowPosition?.target, point.rightWristPosition?.target),
    leftHand: hand(point.leftHand), rightHand: hand(point.rightHand),
  }));
}
function arm(elbow: { x: number; y: number } | undefined, wrist: { x: number; y: number } | undefined): OrchidFingerArmFeatures | null { return elbow ? { elbowFromShoulder: elbow, wristFromShoulder: wrist ?? null, elbowAngleRad: null, confidence: 1 } : null; }
function hand(value: typeof ORCHID_FINGER_REFERENCE.points[number]["leftHand"]): OrchidFingerHandFeatures | null {
  return value ? { palmCenterFromBody: value.palmPosition.target, palmDirectionRad: value.palmDirection.target, fingerExtension: values(value.fingerExtension), fingerCurlRad: values(value.fingerCurlRad), thumbToFingertip: values(value.thumbToFingertip), confidence: 1 } : null;
}
function values<T extends string>(record: Record<T, { target: number }>): Record<T, number> { return Object.fromEntries(Object.entries<{ target: number }>(record).map(([key, value]) => [key, value.target])) as Record<T, number>; }
function distort(handFeatures: OrchidFingerHandFeatures | null): OrchidFingerHandFeatures | null {
  if (!handFeatures) return null;
  const add = <T extends string>(record: Record<T, number>) => Object.fromEntries(Object.entries<number>(record).map(([key, value]) => [key, value + 3])) as Record<T, number>;
  return { ...handFeatures, fingerExtension: add(handFeatures.fingerExtension), fingerCurlRad: add(handFeatures.fingerCurlRad), thumbToFingertip: add(handFeatures.thumbToFingertip) };
}
