import { describe, expect, it } from "vitest";
import type { OpeningDoorFrameFeatures } from "../features/openingDoorFeatures";
import {
  createOpeningDoorTrajectory,
  type OpeningDoorTrajectorySample,
} from "../features/openingDoorTrajectory";
import { buildOpeningDoorReferenceEnvelope } from "./openingDoorEnvelope";

describe("buildOpeningDoorReferenceEnvelope", () => {
  it("combines both normal takes into an image-free compact reference", () => {
    const envelope = buildOpeningDoorReferenceEnvelope(
      [trajectory("take-1", 0), trajectory("take-2", 0.2)],
      3,
    );

    expect(envelope).toMatchObject({
      gestureId: "opening-door",
      sourceFixtureIds: ["take-1", "take-2"],
      derivedFromRecordedImagery: true,
      containsRecordedImagery: false,
      progressPoints: 3,
    });
    expect(envelope.points).toHaveLength(3);
    expect(envelope.points[1]?.leftElbowPosition?.target.x).toBeCloseTo(0.6);
    expect(envelope.points[1]?.leftHandOpenness?.target).toBeCloseTo(2.1);
  });

  it("rejects an empty source set or fewer than two reference points", () => {
    expect(() => buildOpeningDoorReferenceEnvelope([])).toThrow(
      "at least one reference trajectory",
    );
    expect(() => buildOpeningDoorReferenceEnvelope([trajectory("take", 0)], 1)).toThrow(
      "at least two progress points",
    );
  });
});

function trajectory(id: string, variation: number) {
  return createOpeningDoorTrajectory(
    id,
    [0, 0.5, 1].map((progress) => sample(progress, variation)),
    1000,
  );
}

function sample(progress: number, variation: number): OpeningDoorTrajectorySample {
  const arm: NonNullable<OpeningDoorFrameFeatures["leftArm"]> = {
    elbowFromShoulder: { x: progress + variation, y: 0.5 },
    wristFromShoulder: { x: progress + variation, y: 1 },
    elbowAngleRad: 1,
    confidence: 0.9,
  };
  const hand: NonNullable<OpeningDoorFrameFeatures["leftHand"]> = {
    palmCenterFromBody: { x: progress + variation, y: 0.3 },
    palmDirectionRad: 1.2 + variation,
    openness: 2 + variation,
    confidence: 0.9,
  };
  return {
    offsetMs: progress * 1000,
    progress,
    leftArm: arm,
    rightArm: arm,
    leftHand: hand,
    rightHand: hand,
  };
}
