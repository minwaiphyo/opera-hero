import type { VisionLandmarkFrame } from "../../../vision/visionTypes";
import {
  extractWaterSleevesFrameFeatures,
} from "../features/waterSleevesFeatures";
import {
  createWaterSleevesTrajectory,
  type WaterSleevesTrajectory,
  type WaterSleevesTrajectorySample,
} from "../features/waterSleevesTrajectory";

export type LiveAttemptStatus =
  | "idle"
  | "recording"
  | "completed"
  | "timed-out"
  | "cancelled";

export type LiveAttemptTracking =
  | "awaiting"
  | "tracked"
  | "grace"
  | "lost";

export interface WaterSleevesAttemptBufferOptions {
  maximumDurationMs?: number;
  maximumSamples?: number;
  trackingLossGraceMs?: number;
}

export interface LiveAttemptSnapshot {
  attemptId: string | null;
  status: LiveAttemptStatus;
  tracking: LiveAttemptTracking;
  bufferedSamples: number;
  usableSamples: number;
  elapsedMs: number;
}

const DEFAULT_MAXIMUM_DURATION_MS = 12_000;
const DEFAULT_MAXIMUM_SAMPLES = 300;
const DEFAULT_TRACKING_LOSS_GRACE_MS = 750;

export class WaterSleevesAttemptBuffer {
  private readonly maximumDurationMs: number;
  private readonly maximumSamples: number;
  private readonly trackingLossGraceMs: number;
  private attemptId: string | null = null;
  private status: LiveAttemptStatus = "idle";
  private tracking: LiveAttemptTracking = "awaiting";
  private requestedAtMs = 0;
  private captureStartedAtMs: number | null = null;
  private lastFrameAtMs: number | null = null;
  private lastUsableAtMs: number | null = null;
  private samples: WaterSleevesTrajectorySample[] = [];
  private completedTrajectory: WaterSleevesTrajectory | null = null;

  constructor(options: WaterSleevesAttemptBufferOptions = {}) {
    this.maximumDurationMs = positive(
      options.maximumDurationMs ?? DEFAULT_MAXIMUM_DURATION_MS,
      "maximumDurationMs",
    );
    this.maximumSamples = positiveInteger(
      options.maximumSamples ?? DEFAULT_MAXIMUM_SAMPLES,
      "maximumSamples",
    );
    this.trackingLossGraceMs = nonNegative(
      options.trackingLossGraceMs ?? DEFAULT_TRACKING_LOSS_GRACE_MS,
      "trackingLossGraceMs",
    );
  }

  start(attemptId: string, requestedAtMs: number): void {
    if (!attemptId.trim()) throw new Error("attemptId must not be empty.");
    finiteTimestamp(requestedAtMs);
    if (this.status === "recording") {
      throw new Error("A Water Sleeves attempt is already recording.");
    }
    this.attemptId = attemptId;
    this.status = "recording";
    this.tracking = "awaiting";
    this.requestedAtMs = requestedAtMs;
    this.captureStartedAtMs = null;
    this.lastFrameAtMs = null;
    this.lastUsableAtMs = null;
    this.samples = [];
    this.completedTrajectory = null;
  }

  push(frame: VisionLandmarkFrame): LiveAttemptSnapshot {
    if (this.status !== "recording") return this.getSnapshot();
    this.assertMonotonic(frame.capturedAtMs);
    this.lastFrameAtMs = frame.capturedAtMs;

    if (frame.capturedAtMs - this.requestedAtMs >= this.maximumDurationMs) {
      this.finalize("timed-out");
      return this.getSnapshot();
    }

    const features = extractWaterSleevesFrameFeatures(frame);
    const usable = features !== null && features.usableArmCount > 0;
    if (this.captureStartedAtMs === null) {
      if (!usable) {
        this.tracking = "awaiting";
        return this.getSnapshot();
      }
      this.captureStartedAtMs = frame.capturedAtMs;
    }

    const offsetMs = frame.capturedAtMs - this.captureStartedAtMs;
    this.samples.push({
      offsetMs,
      progress: 0,
      leftArm: features?.leftArm ?? null,
      rightArm: features?.rightArm ?? null,
    });
    if (usable) {
      this.lastUsableAtMs = frame.capturedAtMs;
      this.tracking = "tracked";
    } else {
      this.tracking = this.trackingAfterLoss(frame.capturedAtMs);
    }

    if (this.samples.length >= this.maximumSamples) {
      this.finalize("timed-out");
    }
    return this.getSnapshot();
  }

  finish(completedAtMs: number): WaterSleevesTrajectory | null {
    finiteTimestamp(completedAtMs);
    if (this.status !== "recording") return this.completedTrajectory;
    if (this.lastFrameAtMs !== null && completedAtMs < this.lastFrameAtMs) {
      throw new Error("Attempt completion cannot precede the latest frame.");
    }
    this.finalize("completed");
    return this.completedTrajectory;
  }

  cancel(): void {
    if (this.status === "recording") {
      this.status = "cancelled";
      this.tracking = "awaiting";
      this.samples = [];
      this.completedTrajectory = null;
    }
  }

  reset(): void {
    this.attemptId = null;
    this.status = "idle";
    this.tracking = "awaiting";
    this.requestedAtMs = 0;
    this.captureStartedAtMs = null;
    this.lastFrameAtMs = null;
    this.lastUsableAtMs = null;
    this.samples = [];
    this.completedTrajectory = null;
  }

  getSnapshot(): LiveAttemptSnapshot {
    return {
      attemptId: this.attemptId,
      status: this.status,
      tracking: this.tracking,
      bufferedSamples: this.samples.length,
      usableSamples: this.samples.filter(
        (sample) => sample.leftArm !== null || sample.rightArm !== null,
      ).length,
      elapsedMs: this.elapsedMs(),
    };
  }

  getTrajectory(): WaterSleevesTrajectory | null {
    return this.completedTrajectory;
  }

  private finalize(status: "completed" | "timed-out"): void {
    this.status = status;
    if (this.captureStartedAtMs === null || this.samples.length === 0) {
      this.completedTrajectory = null;
      return;
    }
    const durationMs = this.samples.at(-1)?.offsetMs ?? 0;
    const denominator = durationMs > 0 ? durationMs : 1;
    const normalized = this.samples.map((sample) => ({
      ...sample,
      progress: sample.offsetMs / denominator,
    }));
    this.completedTrajectory = createWaterSleevesTrajectory(
      `live-${this.attemptId}`,
      normalized,
      durationMs,
    );
  }

  private trackingAfterLoss(capturedAtMs: number): LiveAttemptTracking {
    if (this.lastUsableAtMs === null) return "awaiting";
    return capturedAtMs - this.lastUsableAtMs <= this.trackingLossGraceMs
      ? "grace"
      : "lost";
  }

  private elapsedMs(): number {
    if (this.lastFrameAtMs === null) return 0;
    return Math.max(0, this.lastFrameAtMs - this.requestedAtMs);
  }

  private assertMonotonic(capturedAtMs: number): void {
    finiteTimestamp(capturedAtMs);
    if (this.lastFrameAtMs !== null && capturedAtMs <= this.lastFrameAtMs) {
      throw new Error("Live attempt frame timestamps must increase monotonically.");
    }
  }
}

function positive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive finite number.`);
  }
  return value;
}

function positiveInteger(value: number, name: string): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer.`);
  }
  return positive(value, name);
}

function nonNegative(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative finite number.`);
  }
  return value;
}

function finiteTimestamp(value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Attempt timestamps must be non-negative finite numbers.");
  }
}
