export const POSE_LANDMARK_COUNT = 33;
export const HAND_LANDMARK_COUNT = 21;

export type VisionLandmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
};

export type VisionWorldLandmark = VisionLandmark;

export type VisionPose = {
  landmarks: readonly VisionLandmark[];
  worldLandmarks: readonly VisionWorldLandmark[];
};

export type ReportedHandedness = "left" | "right" | "unknown";

export type VisionHand = {
  landmarks: readonly VisionLandmark[];
  worldLandmarks: readonly VisionWorldLandmark[];
  reportedHandedness: ReportedHandedness;
  handednessScore: number;
};

export type VisionInferenceTiming = {
  poseMs: number;
  handsMs: number;
  totalMs: number;
};

export type VisionLandmarkFrame = {
  frameId: number;
  capturedAtMs: number;
  completedAtMs: number;
  pose?: VisionPose;
  hands: readonly VisionHand[];
  timing: VisionInferenceTiming;
};
