import type { VisionLandmark, VisionLandmarkFrame } from "../../vision/visionTypes";

export const CALIBRATION_HOLD_MS = 2_000;
export const CALIBRATION_MOTION_THRESHOLD = 0.035;
const MOVEMENT_RESET_MS = 200;
const MAX_FRAME_GAP_MS = 500;
const MIN_VISIBILITY = 0.55;
const POSE_POINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24] as const;

export interface CalibrationSnapshot {
  progress: number;
  complete: boolean;
}

/** Sustained-stillness detector used only while positioning a new visitor. */
export class CalibrationStillness {
  private previous: VisionLandmarkFrame | null = null;
  private stillSinceMs: number | null = null;
  private movingSinceMs: number | null = null;

  push(frame: VisionLandmarkFrame): CalibrationSnapshot {
    if (!usablePose(frame)) {
      this.reset();
      return EMPTY;
    }

    if (
      this.previous &&
      frame.capturedAtMs - this.previous.capturedAtMs > MAX_FRAME_GAP_MS
    ) {
      this.reset();
    }

    const motion = this.previous ? normalizedPoseMotion(this.previous, frame) : null;
    this.previous = frame;
    if (motion === null) {
      this.stillSinceMs = frame.capturedAtMs;
      return EMPTY;
    }

    if (motion <= CALIBRATION_MOTION_THRESHOLD) {
      this.movingSinceMs = null;
      this.stillSinceMs ??= frame.capturedAtMs;
    } else {
      this.movingSinceMs ??= frame.capturedAtMs;
      if (frame.capturedAtMs - this.movingSinceMs >= MOVEMENT_RESET_MS) {
        this.stillSinceMs = null;
      }
    }

    const heldMs = this.stillSinceMs === null
      ? 0
      : frame.capturedAtMs - this.stillSinceMs;
    const progress = Math.min(1, heldMs / CALIBRATION_HOLD_MS);
    return { progress, complete: progress >= 1 };
  }

  reset(): void {
    this.previous = null;
    this.stillSinceMs = null;
    this.movingSinceMs = null;
  }
}

const EMPTY: CalibrationSnapshot = { progress: 0, complete: false };

function normalizedPoseMotion(
  previous: VisionLandmarkFrame,
  current: VisionLandmarkFrame,
): number | null {
  const before = previous.pose?.landmarks;
  const after = current.pose?.landmarks;
  if (!before || !after) return null;
  const shoulderScale = distance(after[11]!, after[12]!);
  if (shoulderScale <= 0.001) return null;

  const distances = POSE_POINTS.flatMap((index) => {
    const from = before[index];
    const to = after[index];
    return visible(from) && visible(to) ? [distance(from, to) / shoulderScale] : [];
  });
  return distances.length >= 6
    ? distances.reduce((sum, value) => sum + value, 0) / distances.length
    : null;
}

function usablePose(frame: VisionLandmarkFrame): boolean {
  const landmarks = frame.pose?.landmarks;
  return Boolean(
    landmarks &&
    visible(landmarks[11]) &&
    visible(landmarks[12]) &&
    visible(landmarks[23]) &&
    visible(landmarks[24]),
  );
}

function visible(point: VisionLandmark | undefined): point is VisionLandmark {
  return Boolean(point && point.visibility >= MIN_VISIBILITY);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
