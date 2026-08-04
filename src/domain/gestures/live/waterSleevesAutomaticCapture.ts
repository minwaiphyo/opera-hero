import type { VisionLandmarkFrame } from "../../../vision/visionTypes";
import {
  extractWaterSleevesFrameFeatures,
  type WaterSleevesFrameFeatures,
} from "../features/waterSleevesFeatures";
import type { WaterSleevesTrajectory } from "../features/waterSleevesTrajectory";
import {
  WaterSleevesAttemptBuffer,
  type LiveAttemptSnapshot,
} from "./waterSleevesAttemptBuffer";

export type AutomaticCapturePhase =
  | "idle"
  | "countdown"
  | "waiting-for-movement"
  | "recording"
  | "completed"
  | "timed-out"
  | "cancelled";

export interface AutomaticCaptureOptions {
  countdownMs?: number;
  motionStartThreshold?: number;
  motionStartFrames?: number;
  stillnessThreshold?: number;
  stillnessDurationMs?: number;
  minimumRecordingMs?: number;
}

export interface AutomaticCaptureSnapshot {
  attemptId: string | null;
  phase: AutomaticCapturePhase;
  countdownRemainingMs: number;
  attempt: LiveAttemptSnapshot;
}

const DEFAULTS = {
  countdownMs: 3000,
  motionStartThreshold: 0.035,
  motionStartFrames: 3,
  stillnessThreshold: 0.015,
  stillnessDurationMs: 1200,
  minimumRecordingMs: 1500,
};

export class WaterSleevesAutomaticCapture {
  private readonly options: typeof DEFAULTS;
  private readonly buffer = new WaterSleevesAttemptBuffer();
  private phase: AutomaticCapturePhase = "idle";
  private attemptId: string | null = null;
  private countdownEndsAtMs = 0;
  private previousFeatures: WaterSleevesFrameFeatures | null = null;
  private consecutiveMotionFrames = 0;
  private recordingStartedAtMs = 0;
  private stillSinceMs: number | null = null;

  constructor(options: AutomaticCaptureOptions = {}) {
    this.options = { ...DEFAULTS, ...options };
  }

  start(attemptId: string, requestedAtMs: number): AutomaticCaptureSnapshot {
    if (!attemptId.trim()) throw new Error("attemptId must not be empty.");
    if (this.isActive()) throw new Error("An automatic attempt is already active.");
    this.buffer.reset();
    this.attemptId = attemptId;
    this.phase = "countdown";
    this.countdownEndsAtMs = requestedAtMs + this.options.countdownMs;
    this.previousFeatures = null;
    this.consecutiveMotionFrames = 0;
    this.recordingStartedAtMs = 0;
    this.stillSinceMs = null;
    return this.getSnapshot(requestedAtMs);
  }

  advance(nowMs: number): AutomaticCaptureSnapshot {
    if (this.phase === "countdown" && nowMs >= this.countdownEndsAtMs) {
      this.phase = "waiting-for-movement";
      this.previousFeatures = null;
    }
    return this.getSnapshot(nowMs);
  }

  push(frame: VisionLandmarkFrame): AutomaticCaptureSnapshot {
    this.advance(frame.capturedAtMs);
    if (this.phase === "waiting-for-movement") {
      this.detectStart(frame);
    } else if (this.phase === "recording") {
      this.capture(frame);
    }
    return this.getSnapshot(frame.capturedAtMs);
  }

  finish(completedAtMs: number): WaterSleevesTrajectory | null {
    if (this.phase !== "recording") return this.buffer.getTrajectory();
    const trajectory = this.buffer.finish(completedAtMs);
    this.phase = "completed";
    return trajectory;
  }

  cancel(): void {
    if (!this.isActive()) return;
    this.buffer.cancel();
    this.phase = "cancelled";
  }

  reset(): void {
    this.buffer.reset();
    this.phase = "idle";
    this.attemptId = null;
    this.previousFeatures = null;
    this.consecutiveMotionFrames = 0;
    this.stillSinceMs = null;
  }

  getSnapshot(nowMs: number): AutomaticCaptureSnapshot {
    return {
      attemptId: this.attemptId,
      phase: this.phase,
      countdownRemainingMs:
        this.phase === "countdown"
          ? Math.max(0, this.countdownEndsAtMs - nowMs)
          : 0,
      attempt: this.buffer.getSnapshot(),
    };
  }

  getTrajectory(): WaterSleevesTrajectory | null {
    return this.buffer.getTrajectory();
  }

  private detectStart(frame: VisionLandmarkFrame): void {
    const features = extractWaterSleevesFrameFeatures(frame);
    if (!features || features.usableArmCount === 0) {
      this.previousFeatures = null;
      this.consecutiveMotionFrames = 0;
      return;
    }
    const motion = this.previousFeatures
      ? armMotion(this.previousFeatures, features)
      : 0;
    this.consecutiveMotionFrames =
      motion >= this.options.motionStartThreshold
        ? this.consecutiveMotionFrames + 1
        : 0;
    this.previousFeatures = features;
    if (this.consecutiveMotionFrames < this.options.motionStartFrames) return;

    this.phase = "recording";
    this.recordingStartedAtMs = frame.capturedAtMs;
    this.buffer.start(this.attemptId!, frame.capturedAtMs);
    this.buffer.push(frame);
  }

  private capture(frame: VisionLandmarkFrame): void {
    const features = extractWaterSleevesFrameFeatures(frame);
    const motion =
      features && this.previousFeatures
        ? armMotion(this.previousFeatures, features)
        : Number.POSITIVE_INFINITY;
    if (features) this.previousFeatures = features;
    const snapshot = this.buffer.push(frame);
    if (snapshot.status === "timed-out") {
      this.phase = "timed-out";
      return;
    }

    const elapsedMs = frame.capturedAtMs - this.recordingStartedAtMs;
    if (elapsedMs < this.options.minimumRecordingMs) return;
    if (motion <= this.options.stillnessThreshold) {
      this.stillSinceMs ??= frame.capturedAtMs;
      if (frame.capturedAtMs - this.stillSinceMs >= this.options.stillnessDurationMs) {
        this.finish(frame.capturedAtMs);
      }
    } else {
      this.stillSinceMs = null;
    }
  }

  private isActive(): boolean {
    return (
      this.phase === "countdown" ||
      this.phase === "waiting-for-movement" ||
      this.phase === "recording"
    );
  }
}

function armMotion(
  previous: WaterSleevesFrameFeatures,
  current: WaterSleevesFrameFeatures,
): number {
  const distances: number[] = [];
  for (const side of ["leftArm", "rightArm"] as const) {
    const before = previous[side];
    const after = current[side];
    if (!before || !after) continue;
    const elbowDistance = Math.hypot(
      after.elbowFromShoulder.x - before.elbowFromShoulder.x,
      after.elbowFromShoulder.y - before.elbowFromShoulder.y,
    );
    const angleDistance = Math.abs(
      Math.atan2(
        Math.sin(after.upperArmAngleRad - before.upperArmAngleRad),
        Math.cos(after.upperArmAngleRad - before.upperArmAngleRad),
      ),
    );
    distances.push(elbowDistance + angleDistance * 0.15);
  }
  return distances.length > 0
    ? distances.reduce((sum, distance) => sum + distance, 0) / distances.length
    : 0;
}
