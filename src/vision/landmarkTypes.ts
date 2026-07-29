export type NormalizedLandmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  presence?: number;
};

export type Handedness = "left" | "right" | "unknown";

export type NormalizedPose = {
  landmarks: readonly NormalizedLandmark[];
  worldLandmarks?: readonly NormalizedLandmark[];
};

export type NormalizedHand = {
  handedness: Handedness;
  score: number;
  landmarks: readonly NormalizedLandmark[];
  worldLandmarks?: readonly NormalizedLandmark[];
};

export type FramingStatus =
  | "absent"
  | "too-close"
  | "too-far"
  | "partial"
  | "good";

export type LandmarkFrame = {
  frameId: number;
  timestampMs: number;
  pose?: NormalizedPose;
  hands: readonly NormalizedHand[];
  trackingQuality: number;
  framing: FramingStatus;
  inferenceDurationMs: number;
};

export type VisionModelProfile = "lite" | "full" | "heavy" | "simulated";

export type VisionCapabilities = {
  adapter: string;
  runtime: "fake" | "mediapipe-worker";
  model: VisionModelProfile;
  poseLandmarkCount: number;
  handLandmarkCount: number;
  maxHands: number;
};

export type VisionFrameInput = {
  frameId: number;
  timestampMs: number;
  width: number;
  height: number;
  source?: ImageBitmap;
};
