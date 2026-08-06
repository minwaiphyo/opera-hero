import type { VisionHand, VisionPose } from "../visionTypes";

export const VISION_REPLAY_SCHEMA_VERSION = 1;

export type VisionReplaySource =
  | "synthetic"
  | "practitioner-reference"
  | "consented-participant";

export interface VisionReplayFrame {
  offsetMs: number;
  pose?: VisionPose;
  hands: readonly VisionHand[];
}

export interface PractitionerExtractionMetadata {
  sourceFile: string;
  sourceDurationMs: number;
  sampleFps: number;
  trimmedStartMs: number;
  trimmedEndMs: number;
  motionDetected: boolean;
  motionThreshold: number;
  motionSustainMs: number;
  edgePaddingMs: number;
}

export interface VisionReplayFixture {
  schemaVersion: typeof VISION_REPLAY_SCHEMA_VERSION;
  id: string;
  description: string;
  source: VisionReplaySource;
  containsRecordedImagery: false;
  extraction?: PractitionerExtractionMetadata;
  frames: readonly VisionReplayFrame[];
}
