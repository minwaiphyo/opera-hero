import type { VisionReplayFixture } from "../../../vision/replay/visionReplayTypes";
import type { VisionLandmarkFrame } from "../../../vision/visionTypes";
import {
  extractOrchidFingerFrameFeatures,
  type OrchidFingerArmFeatures,
  type OrchidFingerHandFeatures,
} from "./orchidFingerFeatures";

export const ORCHID_FINGER_REQUIRED_COVERAGE = 0.9;
export const ORCHID_FINGER_OPTIONAL_COVERAGE = 0.5;

export type OrchidFingerSignal =
  | "leftArmPlacement"
  | "rightArmPlacement"
  | "leftPalmPlacement"
  | "rightPalmPlacement"
  | "leftHandShape"
  | "rightHandShape";

export interface OrchidFingerTrajectorySample {
  offsetMs: number;
  progress: number;
  leftArm: OrchidFingerArmFeatures | null;
  rightArm: OrchidFingerArmFeatures | null;
  leftHand: OrchidFingerHandFeatures | null;
  rightHand: OrchidFingerHandFeatures | null;
}

export interface OrchidFingerSignalAssessment {
  signal: OrchidFingerSignal;
  coverage: number;
  recommendedUse: "required" | "optional" | "excluded";
}

export interface OrchidFingerTrajectory {
  fixtureId: string;
  durationMs: number;
  totalFrames: number;
  usablePoseFrames: number;
  usableHandFrames: number;
  samples: readonly OrchidFingerTrajectorySample[];
  signals: readonly OrchidFingerSignalAssessment[];
}

const SIGNALS: readonly OrchidFingerSignal[] = [
  "leftArmPlacement",
  "rightArmPlacement",
  "leftPalmPlacement",
  "rightPalmPlacement",
  "leftHandShape",
  "rightHandShape",
];

export function extractOrchidFingerTrajectory(
  fixture: VisionReplayFixture,
): OrchidFingerTrajectory {
  const durationMs = fixture.frames.at(-1)?.offsetMs ?? 0;
  const samples = fixture.frames.map((frame) => {
    const features = extractOrchidFingerFrameFeatures({
      capturedAtMs: frame.offsetMs,
      pose: frame.pose,
      hands: frame.hands,
    });
    return {
      offsetMs: frame.offsetMs,
      progress: durationMs > 0 ? frame.offsetMs / durationMs : 0,
      leftArm: features?.leftArm ?? null,
      rightArm: features?.rightArm ?? null,
      leftHand: features?.leftHand ?? null,
      rightHand: features?.rightHand ?? null,
    };
  });
  return createOrchidFingerTrajectory(fixture.id, samples, durationMs);
}

export function extractLiveOrchidFingerTrajectory(
  attemptId: string,
  frames: readonly VisionLandmarkFrame[],
): OrchidFingerTrajectory {
  const startedAtMs = frames[0]?.capturedAtMs ?? 0;
  const durationMs = Math.max(0, (frames.at(-1)?.capturedAtMs ?? startedAtMs) - startedAtMs);
  const samples = frames.map((frame) => {
    const features = extractOrchidFingerFrameFeatures(frame);
    const offsetMs = frame.capturedAtMs - startedAtMs;
    return {
      offsetMs,
      progress: durationMs > 0 ? offsetMs / durationMs : 0,
      leftArm: features?.leftArm ?? null,
      rightArm: features?.rightArm ?? null,
      leftHand: features?.leftHand ?? null,
      rightHand: features?.rightHand ?? null,
    };
  });
  return createOrchidFingerTrajectory(`live-${attemptId}`, samples, durationMs);
}

export function createOrchidFingerTrajectory(
  fixtureId: string,
  samples: readonly OrchidFingerTrajectorySample[],
  durationMs = samples.at(-1)?.offsetMs ?? 0,
): OrchidFingerTrajectory {
  const signals = SIGNALS.map((signal) => {
    const coverage = samples.length > 0
      ? samples.filter((sample) => hasSignal(sample, signal)).length / samples.length
      : 0;
    return { signal, coverage, recommendedUse: recommendedUse(signal, coverage) };
  });
  return {
    fixtureId,
    durationMs,
    totalFrames: samples.length,
    usablePoseFrames: samples.filter((sample) => sample.leftArm || sample.rightArm).length,
    usableHandFrames: samples.filter((sample) => sample.leftHand || sample.rightHand).length,
    samples,
    signals,
  };
}

function hasSignal(sample: OrchidFingerTrajectorySample, signal: OrchidFingerSignal) {
  switch (signal) {
    case "leftArmPlacement": return sample.leftArm?.wristFromShoulder != null;
    case "rightArmPlacement": return sample.rightArm?.wristFromShoulder != null;
    case "leftPalmPlacement":
    case "leftHandShape": return sample.leftHand !== null;
    case "rightPalmPlacement":
    case "rightHandShape": return sample.rightHand !== null;
  }
}

function recommendedUse(
  signal: OrchidFingerSignal,
  coverage: number,
): "required" | "optional" | "excluded" {
  const poseSignal = signal === "leftArmPlacement" || signal === "rightArmPlacement";
  if (poseSignal && coverage >= ORCHID_FINGER_REQUIRED_COVERAGE) return "required";
  return coverage >= ORCHID_FINGER_OPTIONAL_COVERAGE ? "optional" : "excluded";
}
