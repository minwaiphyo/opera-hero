import {
  HAND_LANDMARK_COUNT,
  POSE_LANDMARK_COUNT,
  type VisionHand,
  type VisionLandmark,
  type VisionPose,
} from "../visionTypes";
import type {
  VisionReplayFixture,
  VisionReplayFrame,
} from "./visionReplayTypes";

export const SYNTHETIC_TRACKING_RECOVERY_FIXTURE: VisionReplayFixture = {
  schemaVersion: 1,
  id: "tracking-loss-recovery",
  description:
    "Synthetic upper-body tracking, a short loss interval, and recovery.",
  source: "synthetic",
  containsRecordedImagery: false,
  frames: Array.from({ length: 41 }, (_, index) =>
    createSequenceFrame(index),
  ),
};

function createSequenceFrame(index: number): VisionReplayFrame {
  const offsetMs = index * 50;
  if (index >= 16 && index <= 22) {
    return { offsetMs, hands: [] };
  }

  const phase = index / 40;
  const sway = Math.sin(phase * Math.PI * 2) * 0.018;
  const pose = createPose(sway, phase);
  return {
    offsetMs,
    pose,
    hands: [
      createHand(pose.landmarks[15]!, "left"),
      createHand(pose.landmarks[16]!, "right"),
    ],
  };
}

function createPose(sway: number, phase: number): VisionPose {
  const landmarks = Array.from({ length: POSE_LANDMARK_COUNT }, () =>
    landmark(0.5 + sway, 0.53),
  );

  landmarks[0] = landmark(0.5 + sway, 0.18);
  landmarks[7] = landmark(0.46 + sway, 0.2);
  landmarks[8] = landmark(0.54 + sway, 0.2);
  landmarks[9] = landmark(0.48 + sway, 0.24);
  landmarks[10] = landmark(0.52 + sway, 0.24);
  landmarks[11] = landmark(0.39 + sway, 0.34);
  landmarks[12] = landmark(0.61 + sway, 0.34);
  landmarks[13] = landmark(0.31 + sway, 0.45 - phase * 0.04);
  landmarks[14] = landmark(0.69 + sway, 0.45 - phase * 0.04);
  landmarks[15] = landmark(0.24 + sway, 0.56 - phase * 0.08);
  landmarks[16] = landmark(0.76 + sway, 0.56 - phase * 0.08);
  landmarks[17] = landmark(0.23 + sway, 0.55 - phase * 0.08);
  landmarks[18] = landmark(0.77 + sway, 0.55 - phase * 0.08);
  landmarks[19] = landmark(0.24 + sway, 0.54 - phase * 0.08);
  landmarks[20] = landmark(0.76 + sway, 0.54 - phase * 0.08);
  landmarks[21] = landmark(0.25 + sway, 0.56 - phase * 0.08);
  landmarks[22] = landmark(0.75 + sway, 0.56 - phase * 0.08);
  landmarks[23] = landmark(0.43 + sway, 0.65);
  landmarks[24] = landmark(0.57 + sway, 0.65);
  landmarks[25] = landmark(0.43 + sway, 0.8);
  landmarks[26] = landmark(0.57 + sway, 0.8);
  landmarks[27] = landmark(0.43 + sway, 0.94);
  landmarks[28] = landmark(0.57 + sway, 0.94);
  landmarks[29] = landmark(0.42 + sway, 0.96);
  landmarks[30] = landmark(0.58 + sway, 0.96);
  landmarks[31] = landmark(0.44 + sway, 0.98);
  landmarks[32] = landmark(0.56 + sway, 0.98);

  return {
    landmarks,
    worldLandmarks: landmarks.map((point) => ({ ...point })),
  };
}

function createHand(
  wrist: VisionLandmark,
  reportedHandedness: "left" | "right",
): VisionHand {
  const direction = reportedHandedness === "left" ? -1 : 1;
  const landmarks = Array.from({ length: HAND_LANDMARK_COUNT }, (_, index) => {
    if (index === 0) {
      return { ...wrist };
    }
    const finger = Math.floor((index - 1) / 4);
    const joint = ((index - 1) % 4) + 1;
    return landmark(
      wrist.x + direction * (0.008 + finger * 0.009),
      wrist.y - joint * 0.018,
    );
  });

  return {
    landmarks,
    worldLandmarks: landmarks.map((point) => ({ ...point })),
    reportedHandedness,
    handednessScore: 0.99,
  };
}

function landmark(x: number, y: number): VisionLandmark {
  return { x, y, z: 0, visibility: 0.95 };
}
