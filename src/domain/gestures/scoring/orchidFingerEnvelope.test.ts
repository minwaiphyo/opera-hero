import { describe, expect, it } from "vitest";
import type { OrchidFingerArmFeatures, OrchidFingerHandFeatures } from "../features/orchidFingerFeatures";
import { createOrchidFingerTrajectory, type OrchidFingerTrajectorySample } from "../features/orchidFingerTrajectory";
import { buildOrchidFingerReferenceEnvelope } from "./orchidFingerEnvelope";

describe("buildOrchidFingerReferenceEnvelope", () => {
  it("combines normal takes into a compact image-free reference", () => {
    const envelope = buildOrchidFingerReferenceEnvelope([trajectory("take-1", 0), trajectory("take-2", 0.2)], 3);
    expect(envelope).toMatchObject({ gestureId: "orchid-finger", sourceFixtureIds: ["take-1", "take-2"], derivedFromRecordedImagery: true, containsRecordedImagery: false, progressPoints: 3 });
    expect(envelope.points[1]?.leftWristPosition?.target.x).toBeCloseTo(0.6);
    expect(envelope.points[1]?.leftHand?.fingerExtension.index.target).toBeCloseTo(2.1);
    expect(envelope.points[1]?.leftHand?.thumbToFingertip.ring.target).toBeCloseTo(0.3);
  });

  it("rejects an empty source set or fewer than two points", () => {
    expect(() => buildOrchidFingerReferenceEnvelope([])).toThrow("at least one reference trajectory");
    expect(() => buildOrchidFingerReferenceEnvelope([trajectory("take", 0)], 1)).toThrow("at least two progress points");
  });
});

function trajectory(id: string, variation: number) { return createOrchidFingerTrajectory(id, [0, 0.5, 1].map((progress) => sample(progress, variation)), 1000); }
function sample(progress: number, variation: number): OrchidFingerTrajectorySample {
  const arm: OrchidFingerArmFeatures = { elbowFromShoulder: { x: progress + variation, y: 0.5 }, wristFromShoulder: { x: progress + variation, y: 1 }, elbowAngleRad: 1, confidence: 0.9 };
  const hand: OrchidFingerHandFeatures = { palmCenterFromBody: { x: progress + variation, y: 0.3 }, palmDirectionRad: 1.2 + variation, fingerExtension: { thumb: 1 + variation, index: 2 + variation, middle: 2 + variation, ring: 1 + variation, pinky: 1 + variation }, fingerCurlRad: { index: 2 + variation, middle: 2 + variation, ring: 1 + variation, pinky: 1 + variation }, thumbToFingertip: { index: 1 + variation, middle: 1 + variation, ring: 0.2 + variation, pinky: 0.5 + variation }, confidence: 0.9 };
  return { offsetMs: progress * 1000, progress, leftArm: arm, rightArm: arm, leftHand: hand, rightHand: hand };
}
