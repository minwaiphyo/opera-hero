import type { VisionLandmarkFrame, VisionPose } from "./visionTypes";

export type VisionFraming = "absent" | "too-close" | "too-far" | "good";
export type TrackingQualityBand = "lost" | "poor" | "fair" | "good";

export interface VisionTrackingAssessment {
  presence: boolean;
  framing: VisionFraming;
  score: number;
  band: TrackingQualityBand;
  poseVisibility: number;
  inFrameCoverage: number;
  handsDetected: number;
  upperBodyScale: number;
}

export interface VisionQualityThresholds {
  minimumPresenceVisibility: number;
  tooFarUpperBodyScale: number;
  tooCloseUpperBodyScale: number;
  frameMargin: number;
}

export const DEFAULT_VISION_QUALITY_THRESHOLDS: VisionQualityThresholds = {
  minimumPresenceVisibility: 0.5,
  tooFarUpperBodyScale: 0.25,
  tooCloseUpperBodyScale: 0.72,
  frameMargin: 0.04,
};

const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_ELBOW = 13;
const RIGHT_ELBOW = 14;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;

const PRESENCE_INDICES = [
  NOSE,
  LEFT_SHOULDER,
  RIGHT_SHOULDER,
  LEFT_HIP,
  RIGHT_HIP,
] as const;

const UPPER_BODY_INDICES = [
  ...PRESENCE_INDICES,
  LEFT_ELBOW,
  RIGHT_ELBOW,
  LEFT_WRIST,
  RIGHT_WRIST,
] as const;

export function assessVisionTracking(
  frame: VisionLandmarkFrame,
  thresholds: VisionQualityThresholds =
    DEFAULT_VISION_QUALITY_THRESHOLDS,
): VisionTrackingAssessment {
  if (!frame.pose) {
    return absentAssessment();
  }

  const presenceVisibility = averageVisibility(
    frame.pose,
    PRESENCE_INDICES,
  );
  const presence =
    presenceVisibility >= thresholds.minimumPresenceVisibility;
  if (!presence) {
    return absentAssessment();
  }

  const poseVisibility = averageVisibility(frame.pose, UPPER_BODY_INDICES);
  const inFrameCoverage = calculateCoverage(
    frame.pose,
    UPPER_BODY_INDICES,
    thresholds.frameMargin,
  );
  const upperBodyScale = calculateUpperBodyScale(frame.pose);
  const handsDetected = Math.min(2, frame.hands.length);
  const handCoverage = handsDetected / 2;
  const score = clamp01(
    poseVisibility * 0.6 + inFrameCoverage * 0.2 + handCoverage * 0.2,
  );

  return {
    presence: true,
    framing: classifyFraming(upperBodyScale, thresholds),
    score,
    band: qualityBand(score),
    poseVisibility,
    inFrameCoverage,
    handsDetected,
    upperBodyScale,
  };
}

function calculateUpperBodyScale(pose: VisionPose): number {
  const nose = pose.landmarks[NOSE];
  const leftHip = pose.landmarks[LEFT_HIP];
  const rightHip = pose.landmarks[RIGHT_HIP];
  if (!nose || !leftHip || !rightHip) {
    return 0;
  }

  const hipX = (leftHip.x + rightHip.x) / 2;
  const hipY = (leftHip.y + rightHip.y) / 2;
  return Math.hypot(nose.x - hipX, nose.y - hipY);
}

function averageVisibility(
  pose: VisionPose,
  indices: readonly number[],
): number {
  const values = indices
    .map((index) => pose.landmarks[index]?.visibility)
    .filter((value): value is number => value !== undefined);
  if (values.length !== indices.length) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function calculateCoverage(
  pose: VisionPose,
  indices: readonly number[],
  margin: number,
): number {
  const inside = indices.filter((index) => {
    const landmark = pose.landmarks[index];
    return (
      landmark !== undefined &&
      landmark.x >= margin &&
      landmark.x <= 1 - margin &&
      landmark.y >= margin &&
      landmark.y <= 1 - margin
    );
  }).length;
  return inside / indices.length;
}

function classifyFraming(
  upperBodyScale: number,
  thresholds: VisionQualityThresholds,
): VisionFraming {
  if (upperBodyScale < thresholds.tooFarUpperBodyScale) {
    return "too-far";
  }
  if (upperBodyScale > thresholds.tooCloseUpperBodyScale) {
    return "too-close";
  }
  return "good";
}

function qualityBand(score: number): TrackingQualityBand {
  if (score < 0.35) {
    return "poor";
  }
  if (score < 0.8) {
    return "fair";
  }
  return "good";
}

function absentAssessment(): VisionTrackingAssessment {
  return {
    presence: false,
    framing: "absent",
    score: 0,
    band: "lost",
    poseVisibility: 0,
    inFrameCoverage: 0,
    handsDetected: 0,
    upperBodyScale: 0,
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
