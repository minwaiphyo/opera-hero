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

export interface VisionReplayFixture {
  schemaVersion: typeof VISION_REPLAY_SCHEMA_VERSION;
  id: string;
  description: string;
  source: VisionReplaySource;
  containsRecordedImagery: false;
  frames: readonly VisionReplayFrame[];
}
