import type { VisionReplayFixture } from "../../../vision/replay/visionReplayTypes";
import type { VisionLandmarkFrame } from "../../../vision/visionTypes";
import {
  extractOpeningDoorFrameFeatures,
  type OpeningDoorArmFeatures,
  type OpeningDoorHandFeatures,
} from "./openingDoorFeatures";

export const OPENING_DOOR_REQUIRED_COVERAGE = 0.9;
export const OPENING_DOOR_OPTIONAL_COVERAGE = 0.5;
export type OpeningDoorSignalUse = "required" | "optional" | "excluded";

export type OpeningDoorSignal =
  | "leftElbowPosition"
  | "rightElbowPosition"
  | "leftWristPosition"
  | "rightWristPosition"
  | "leftElbowAngle"
  | "rightElbowAngle"
  | "leftPalmPosition"
  | "rightPalmPosition"
  | "leftPalmDirection"
  | "rightPalmDirection"
  | "leftHandOpenness"
  | "rightHandOpenness";

export interface OpeningDoorTrajectorySample {
  offsetMs: number;
  progress: number;
  leftArm: OpeningDoorArmFeatures | null;
  rightArm: OpeningDoorArmFeatures | null;
  leftHand: OpeningDoorHandFeatures | null;
  rightHand: OpeningDoorHandFeatures | null;
}

export interface OpeningDoorSignalAssessment {
  signal: OpeningDoorSignal;
  coverage: number;
  recommendedUse: OpeningDoorSignalUse;
}

export interface OpeningDoorTrajectory {
  fixtureId: string;
  durationMs: number;
  totalFrames: number;
  usablePoseFrames: number;
  usableHandFrames: number;
  samples: readonly OpeningDoorTrajectorySample[];
  signals: readonly OpeningDoorSignalAssessment[];
}

const REQUIRED_SIGNALS = new Set<OpeningDoorSignal>([
  "leftElbowPosition",
  "rightElbowPosition",
  "leftWristPosition",
  "rightWristPosition",
]);

const ALL_SIGNALS: readonly OpeningDoorSignal[] = [
  "leftElbowPosition",
  "rightElbowPosition",
  "leftWristPosition",
  "rightWristPosition",
  "leftElbowAngle",
  "rightElbowAngle",
  "leftPalmPosition",
  "rightPalmPosition",
  "leftPalmDirection",
  "rightPalmDirection",
  "leftHandOpenness",
  "rightHandOpenness",
];

export function extractOpeningDoorTrajectory(
  fixture: VisionReplayFixture,
): OpeningDoorTrajectory {
  const durationMs = fixture.frames.at(-1)?.offsetMs ?? 0;
  const samples = fixture.frames.map((frame) => {
    const features = extractOpeningDoorFrameFeatures({
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
  return createOpeningDoorTrajectory(fixture.id, samples, durationMs);
}

export function extractLiveOpeningDoorTrajectory(
  attemptId: string,
  frames: readonly VisionLandmarkFrame[],
): OpeningDoorTrajectory {
  const startedAtMs = frames[0]?.capturedAtMs ?? 0;
  const durationMs = Math.max(
    0,
    (frames.at(-1)?.capturedAtMs ?? startedAtMs) - startedAtMs,
  );
  const samples = frames.map((frame) => {
    const features = extractOpeningDoorFrameFeatures(frame);
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
  return createOpeningDoorTrajectory(`live-${attemptId}`, samples, durationMs);
}

export function createOpeningDoorTrajectory(
  fixtureId: string,
  samples: readonly OpeningDoorTrajectorySample[],
  durationMs = samples.at(-1)?.offsetMs ?? 0,
): OpeningDoorTrajectory {
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
    fixtureId,
    durationMs,
    totalFrames: samples.length,
    usablePoseFrames: samples.filter(
      (sample) => sample.leftArm !== null || sample.rightArm !== null,
    ).length,
    usableHandFrames: samples.filter(
      (sample) => sample.leftHand !== null || sample.rightHand !== null,
    ).length,
    samples,
    signals,
  };
}

function recommendSignalUse(
  signal: OpeningDoorSignal,
  coverage: number,
): OpeningDoorSignalUse {
  if (REQUIRED_SIGNALS.has(signal) && coverage >= OPENING_DOOR_REQUIRED_COVERAGE) {
    return "required";
  }
  return coverage >= OPENING_DOOR_OPTIONAL_COVERAGE ? "optional" : "excluded";
}

function hasSignal(
  sample: OpeningDoorTrajectorySample,
  signal: OpeningDoorSignal,
): boolean {
  switch (signal) {
    case "leftElbowPosition": return sample.leftArm !== null;
    case "rightElbowPosition": return sample.rightArm !== null;
    case "leftWristPosition": return sample.leftArm?.wristFromShoulder !== null && sample.leftArm !== null;
    case "rightWristPosition": return sample.rightArm?.wristFromShoulder !== null && sample.rightArm !== null;
    case "leftElbowAngle": return sample.leftArm?.elbowAngleRad !== null && sample.leftArm !== null;
    case "rightElbowAngle": return sample.rightArm?.elbowAngleRad !== null && sample.rightArm !== null;
    case "leftPalmPosition":
    case "leftPalmDirection":
    case "leftHandOpenness": return sample.leftHand !== null;
    case "rightPalmPosition":
    case "rightPalmDirection":
    case "rightHandOpenness": return sample.rightHand !== null;
  }
}
