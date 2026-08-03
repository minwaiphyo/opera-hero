import type { VisionReplayFixture } from "../../../vision/replay/visionReplayTypes";
import {
  extractWaterSleevesFrameFeatures,
  type WaterSleevesArmFeatures,
} from "./waterSleevesFeatures";

export const WATER_SLEEVES_REQUIRED_COVERAGE = 0.9;
export const WATER_SLEEVES_OPTIONAL_COVERAGE = 0.5;

export type WaterSleevesSignal =
  | "leftUpperArmAngle"
  | "rightUpperArmAngle"
  | "leftElbowPosition"
  | "rightElbowPosition"
  | "leftElbowAngle"
  | "rightElbowAngle"
  | "leftWristPosition"
  | "rightWristPosition";

export type SignalUse = "required" | "optional" | "excluded";

export interface WaterSleevesTrajectorySample {
  offsetMs: number;
  progress: number;
  leftArm: WaterSleevesArmFeatures | null;
  rightArm: WaterSleevesArmFeatures | null;
}

export interface WaterSleevesSignalAssessment {
  signal: WaterSleevesSignal;
  coverage: number;
  recommendedUse: SignalUse;
}

export interface WaterSleevesTrajectory {
  fixtureId: string;
  durationMs: number;
  totalFrames: number;
  usableFrames: number;
  samples: readonly WaterSleevesTrajectorySample[];
  signals: readonly WaterSleevesSignalAssessment[];
}

const CORE_SIGNALS = new Set<WaterSleevesSignal>([
  "leftUpperArmAngle",
  "rightUpperArmAngle",
  "leftElbowPosition",
  "rightElbowPosition",
]);

export function extractWaterSleevesTrajectory(
  fixture: VisionReplayFixture,
): WaterSleevesTrajectory {
  const durationMs = fixture.frames.at(-1)?.offsetMs ?? 0;
  const samples = fixture.frames.map((frame) => {
    const features = extractWaterSleevesFrameFeatures({
      capturedAtMs: frame.offsetMs,
      pose: frame.pose,
    });
    return {
      offsetMs: frame.offsetMs,
      progress: durationMs > 0 ? frame.offsetMs / durationMs : 0,
      leftArm: features?.leftArm ?? null,
      rightArm: features?.rightArm ?? null,
    };
  });
  const signals = ALL_SIGNALS.map((signal) => {
    const available = samples.filter((sample) => hasSignal(sample, signal)).length;
    const coverage = samples.length > 0 ? available / samples.length : 0;
    return {
      signal,
      coverage,
      recommendedUse: recommendSignalUse(signal, coverage),
    };
  });

  return {
    fixtureId: fixture.id,
    durationMs,
    totalFrames: samples.length,
    usableFrames: samples.filter(
      (sample) => sample.leftArm !== null || sample.rightArm !== null,
    ).length,
    samples,
    signals,
  };
}

const ALL_SIGNALS: readonly WaterSleevesSignal[] = [
  "leftUpperArmAngle",
  "rightUpperArmAngle",
  "leftElbowPosition",
  "rightElbowPosition",
  "leftElbowAngle",
  "rightElbowAngle",
  "leftWristPosition",
  "rightWristPosition",
];

function recommendSignalUse(
  signal: WaterSleevesSignal,
  coverage: number,
): SignalUse {
  if (CORE_SIGNALS.has(signal) && coverage >= WATER_SLEEVES_REQUIRED_COVERAGE) {
    return "required";
  }
  return coverage >= WATER_SLEEVES_OPTIONAL_COVERAGE ? "optional" : "excluded";
}

function hasSignal(
  sample: WaterSleevesTrajectorySample,
  signal: WaterSleevesSignal,
): boolean {
  switch (signal) {
    case "leftUpperArmAngle":
    case "leftElbowPosition":
      return sample.leftArm !== null;
    case "rightUpperArmAngle":
    case "rightElbowPosition":
      return sample.rightArm !== null;
    case "leftElbowAngle":
      return sample.leftArm?.elbowAngleRad !== null && sample.leftArm !== null;
    case "rightElbowAngle":
      return sample.rightArm?.elbowAngleRad !== null && sample.rightArm !== null;
    case "leftWristPosition":
      return sample.leftArm?.wristFromShoulder !== null && sample.leftArm !== null;
    case "rightWristPosition":
      return sample.rightArm?.wristFromShoulder !== null && sample.rightArm !== null;
  }
}
