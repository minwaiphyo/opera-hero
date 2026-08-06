import type { VisionLandmarkFrame } from "../../../vision/visionTypes";
import { extractWaterSleevesFrameFeatures } from "../features/waterSleevesFeatures";
import type { WaterSleevesTrajectory } from "../features/waterSleevesTrajectory";
import {
  WaterSleevesAttemptBuffer,
  type LiveAttemptSnapshot,
  type WaterSleevesAttemptBufferOptions,
} from "./waterSleevesAttemptBuffer";

export type AutomaticCapturePhase =
  | "idle"
  | "countdown"
  | "recording"
  | "completed"
  | "timed-out"
  | "cancelled";

export interface AutomaticCaptureOptions extends WaterSleevesAttemptBufferOptions {
  countdownMs?: number;
  stillnessThreshold?: number;
  stillnessDurationMs?: number;
  minimumRecordingMs?: number;
  minimumPostMovementMs?: number;
  motionEstimator?: (
    previous: VisionLandmarkFrame,
    current: VisionLandmarkFrame,
  ) => number | null;
  requireMovementBeforeCompletion?: boolean;
  motionResetDurationMs?: number;
}

export interface AutomaticCaptureSnapshot {
  attemptId: string | null;
  phase: AutomaticCapturePhase;
  countdownRemainingMs: number;
  attempt: LiveAttemptSnapshot;
}

const DEFAULTS = {
  countdownMs: 5000,
  stillnessThreshold: 0.025,
  stillnessDurationMs: 800,
  minimumRecordingMs: 1500,
  minimumPostMovementMs: 3000,
  requireMovementBeforeCompletion: true,
  motionResetDurationMs: 0,
};
const COMPLETION_ARMING_MOTION = 0.02;

export class WaterSleevesAutomaticCapture {
  private readonly options: typeof DEFAULTS;
  private readonly buffer: WaterSleevesAttemptBuffer;
  private readonly motionEstimator: NonNullable<AutomaticCaptureOptions["motionEstimator"]>;
  private phase: AutomaticCapturePhase = "idle";
  private attemptId: string | null = null;
  private countdownEndsAtMs = 0;
  private previousFrame: VisionLandmarkFrame | null = null;
  private recordingStartedAtMs = 0;
  private stillSinceMs: number | null = null;
  private accumulatedMotion = 0;
  private movementObservedAtMs: number | null = null;
  private movingSinceMs: number | null = null;

  constructor(options: AutomaticCaptureOptions = {}) {
    this.options = { ...DEFAULTS, ...options };
    this.buffer = new WaterSleevesAttemptBuffer(options);
    this.motionEstimator = options.motionEstimator ?? poseArmMotion;
  }

  start(attemptId: string, requestedAtMs: number): AutomaticCaptureSnapshot {
    if (!attemptId.trim()) throw new Error("attemptId must not be empty.");
    if (this.isActive()) throw new Error("An automatic attempt is already active.");
    this.buffer.reset();
    this.attemptId = attemptId;
    this.phase = "countdown";
    this.countdownEndsAtMs = requestedAtMs + this.options.countdownMs;
    this.previousFrame = null;
    this.recordingStartedAtMs = 0;
    this.stillSinceMs = null;
    this.accumulatedMotion = 0;
    this.movementObservedAtMs = null;
    this.movingSinceMs = null;
    return this.getSnapshot(requestedAtMs);
  }

  advance(nowMs: number): AutomaticCaptureSnapshot {
    if (this.phase === "countdown" && nowMs >= this.countdownEndsAtMs) {
      this.phase = "recording";
      this.previousFrame = null;
      this.recordingStartedAtMs = this.countdownEndsAtMs;
      this.buffer.start(this.attemptId!, this.countdownEndsAtMs);
    }
    return this.getSnapshot(nowMs);
  }

  push(frame: VisionLandmarkFrame): AutomaticCaptureSnapshot {
    this.advance(frame.capturedAtMs);
    if (this.phase === "recording") {
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
    this.previousFrame = null;
    this.stillSinceMs = null;
    this.accumulatedMotion = 0;
    this.movementObservedAtMs = null;
    this.movingSinceMs = null;
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

  private capture(frame: VisionLandmarkFrame): void {
    const motion = this.previousFrame
      ? this.motionEstimator(this.previousFrame, frame) ?? Number.POSITIVE_INFINITY
      : Number.POSITIVE_INFINITY;
    this.previousFrame = frame;
    if (Number.isFinite(motion)) this.accumulatedMotion += motion;
    if (
      this.movementObservedAtMs === null &&
      this.accumulatedMotion >= COMPLETION_ARMING_MOTION
    ) {
      this.movementObservedAtMs = frame.capturedAtMs;
    }
    const snapshot = this.buffer.push(frame);
    if (snapshot.status === "timed-out") {
      this.phase = "timed-out";
      return;
    }

    if (motion <= this.options.stillnessThreshold) {
      this.movingSinceMs = null;
      this.stillSinceMs ??= frame.capturedAtMs;
    } else {
      this.movingSinceMs ??= frame.capturedAtMs;
      if (
        frame.capturedAtMs - this.movingSinceMs >=
        this.options.motionResetDurationMs
      ) {
        this.stillSinceMs = null;
      }
    }
    const elapsedMs = frame.capturedAtMs - this.recordingStartedAtMs;
    if (elapsedMs < this.options.minimumRecordingMs) return;
    const movementObservedAtMs = this.movementObservedAtMs;
    if (this.options.requireMovementBeforeCompletion && movementObservedAtMs === null) return;
    if (this.options.requireMovementBeforeCompletion &&
      frame.capturedAtMs - movementObservedAtMs! <
      this.options.minimumPostMovementMs
    ) return;
    if (
      this.stillSinceMs !== null &&
      frame.capturedAtMs - this.stillSinceMs >= this.options.stillnessDurationMs
    ) {
      this.finish(frame.capturedAtMs);
    }
  }

  private isActive(): boolean {
    return (
      this.phase === "countdown" ||
      this.phase === "recording"
    );
  }
}

function armMotion(
  previous: NonNullable<ReturnType<typeof extractWaterSleevesFrameFeatures>>,
  current: NonNullable<ReturnType<typeof extractWaterSleevesFrameFeatures>>,
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
      angleDelta(after.upperArmAngleRad, before.upperArmAngleRad),
    );
    const wristDistance = before.wristFromShoulder && after.wristFromShoulder
      ? Math.hypot(
          after.wristFromShoulder.x - before.wristFromShoulder.x,
          after.wristFromShoulder.y - before.wristFromShoulder.y,
        )
      : 0;
    const elbowAngleDistance =
      before.elbowAngleRad !== null && after.elbowAngleRad !== null
        ? Math.abs(angleDelta(after.elbowAngleRad, before.elbowAngleRad))
        : 0;
    distances.push(
      elbowDistance +
      angleDistance * 0.15 +
      wristDistance * 0.5 +
      elbowAngleDistance * 0.1,
    );
  }
  return distances.length > 0
    ? distances.reduce((sum, distance) => sum + distance, 0) / distances.length
    : 0;
}

function poseArmMotion(
  previousFrame: VisionLandmarkFrame,
  currentFrame: VisionLandmarkFrame,
): number | null {
  const previous = extractWaterSleevesFrameFeatures(previousFrame);
  const current = extractWaterSleevesFrameFeatures(currentFrame);
  return previous && current ? armMotion(previous, current) : null;
}

function angleDelta(current: number, previous: number): number {
  return Math.atan2(
    Math.sin(current - previous),
    Math.cos(current - previous),
  );
}
