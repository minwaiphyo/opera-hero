import { describe, expect, it } from "vitest";
import type { WaterSleevesArmFeatures } from "../features/waterSleevesFeatures";
import type { WaterSleevesTrajectory } from "../features/waterSleevesTrajectory";
import { buildWaterSleevesReferenceEnvelope } from "./waterSleevesEnvelope";
import { evaluateWaterSleevesTrajectory } from "./waterSleevesEvaluator";

describe("Water Sleeves temporal evaluator", () => {
  it("gives a strong soft score to the reference movement", () => {
    const source = trajectory();
    const reference = buildWaterSleevesReferenceEnvelope(source, 21);

    const evaluation = evaluateWaterSleevesTrajectory(source, reference);

    expect(evaluation.overallScore).toBeGreaterThan(0.95);
    expect(evaluation.trackingStatus).toBe("good");
    expect(evaluation.alignedPairs).toBeGreaterThanOrEqual(source.samples.length);
  });

  it("aligns a slower duplicate-frame performance", () => {
    const source = trajectory();
    const reference = buildWaterSleevesReferenceEnvelope(source, 21);
    const slower = withDuplicatedFrames(source);

    const evaluation = evaluateWaterSleevesTrajectory(slower, reference);

    expect(evaluation.overallScore).toBeGreaterThan(0.95);
    expect(evaluation.trackingStatus).toBe("good");
  });

  it("tolerates a short required-signal dropout", () => {
    const source = trajectory();
    const reference = buildWaterSleevesReferenceEnvelope(source, 21);
    const interrupted = withMissingArms(source, 17, 20);

    const evaluation = evaluateWaterSleevesTrajectory(interrupted, reference);

    expect(evaluation.trackingCoverage).toBeGreaterThan(0.85);
    expect(evaluation.trackingStatus).toBe("good");
    expect(evaluation.overallScore).toBeGreaterThan(0.85);
  });

  it("marks prolonged missing arms as insufficient and reduces the score", () => {
    const source = trajectory();
    const reference = buildWaterSleevesReferenceEnvelope(source, 21);
    const mostlyMissing = withMissingArms(source, 5, 35);

    const evaluation = evaluateWaterSleevesTrajectory(mostlyMissing, reference);

    expect(evaluation.trackingStatus).toBe("insufficient");
    expect(evaluation.overallScore).toBeLessThan(0.5);
  });

  it("softly scores a substantially altered arm path lower", () => {
    const source = trajectory();
    const reference = buildWaterSleevesReferenceEnvelope(source, 21);
    const altered = trajectory({ angleOffset: 1.4, positionOffset: 1.1 });

    const evaluation = evaluateWaterSleevesTrajectory(altered, reference);

    expect(evaluation.overallScore).toBeLessThan(0.25);
    expect(evaluation.trackingStatus).toBe("good");
  });

  it("returns an explicit insufficient result for an empty sequence", () => {
    const source = trajectory();
    const reference = buildWaterSleevesReferenceEnvelope(source, 21);
    const empty = { ...source, samples: [], totalFrames: 0, usableFrames: 0 };

    expect(evaluateWaterSleevesTrajectory(empty, reference)).toMatchObject({
      overallScore: 0,
      trackingCoverage: 0,
      trackingStatus: "insufficient",
      alignedPairs: 0,
    });
  });
});

function trajectory(
  options: { angleOffset?: number; positionOffset?: number } = {},
): WaterSleevesTrajectory {
  const frameCount = 41;
  const samples = Array.from({ length: frameCount }, (_, index) => {
    const progress = index / (frameCount - 1);
    const angle = Math.sin(progress * Math.PI * 2) * 0.8;
    return {
      offsetMs: index * 50,
      progress,
      leftArm: arm(
        angle + (options.angleOffset ?? 0),
        -0.5 + (options.positionOffset ?? 0),
      ),
      rightArm: arm(
        -angle - (options.angleOffset ?? 0),
        0.5 + (options.positionOffset ?? 0),
      ),
    };
  });
  return {
    fixtureId: "candidate",
    durationMs: 2000,
    totalFrames: frameCount,
    usableFrames: frameCount,
    samples,
    signals: [],
  };
}

function arm(angle: number, x: number): WaterSleevesArmFeatures {
  return {
    upperArmAngleRad: angle,
    elbowFromShoulder: { x, y: -0.75 + angle * 0.1 },
    elbowAngleRad: null,
    wristFromShoulder: null,
    confidence: 0.9,
  };
}

function withDuplicatedFrames(
  source: WaterSleevesTrajectory,
): WaterSleevesTrajectory {
  const samples = source.samples.flatMap((sample) => [sample, sample]).map(
    (sample, index, all) => ({
      ...sample,
      offsetMs: index * 50,
      progress: index / (all.length - 1),
    }),
  );
  return {
    ...source,
    durationMs: samples.at(-1)?.offsetMs ?? 0,
    totalFrames: samples.length,
    usableFrames: samples.length,
    samples,
  };
}

function withMissingArms(
  source: WaterSleevesTrajectory,
  start: number,
  end: number,
): WaterSleevesTrajectory {
  const samples = source.samples.map((sample, index) =>
    index >= start && index <= end
      ? { ...sample, leftArm: null, rightArm: null }
      : sample,
  );
  return {
    ...source,
    usableFrames: samples.filter(
      (sample) => sample.leftArm !== null || sample.rightArm !== null,
    ).length,
    samples,
  };
}
