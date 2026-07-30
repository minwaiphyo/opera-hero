import type { LatestFrameSchedulerStats } from "./latestFrameScheduler";
import type { VisionLandmarkFrame } from "./visionTypes";
import {
  assessVisionTracking,
  type TrackingQualityBand,
  type VisionFraming,
} from "./visionQuality";

export interface VisionDiagnosticsSnapshot {
  completedFrames: number;
  effectiveFps: number;
  latestInferenceMs: number;
  inferenceP50Ms: number;
  inferenceP95Ms: number;
  captureToResultP50Ms: number;
  captureToResultP95Ms: number;
  submittedFrames: number;
  sentFrames: number;
  replacedFrames: number;
  rejectedFrames: number;
  replacementRate: number;
  inFlight: boolean;
  pending: boolean;
  presence: boolean;
  framing: VisionFraming;
  trackingQuality: number;
  trackingBand: TrackingQualityBand;
  poseVisibility: number;
  inFrameCoverage: number;
  handsDetected: number;
  upperBodyScale: number;
}

interface VisionTimingSample {
  completedAtMs: number;
  inferenceMs: number;
  captureToResultMs: number;
}

export const EMPTY_VISION_DIAGNOSTICS: VisionDiagnosticsSnapshot = {
  completedFrames: 0,
  effectiveFps: 0,
  latestInferenceMs: 0,
  inferenceP50Ms: 0,
  inferenceP95Ms: 0,
  captureToResultP50Ms: 0,
  captureToResultP95Ms: 0,
  submittedFrames: 0,
  sentFrames: 0,
  replacedFrames: 0,
  rejectedFrames: 0,
  replacementRate: 0,
  inFlight: false,
  pending: false,
  presence: false,
  framing: "absent",
  trackingQuality: 0,
  trackingBand: "lost",
  poseVisibility: 0,
  inFrameCoverage: 0,
  handsDetected: 0,
  upperBodyScale: 0,
};

export class VisionDiagnosticsAccumulator {
  private readonly samples: VisionTimingSample[] = [];
  private completedFrames = 0;

  constructor(private readonly sampleLimit = 120) {
    if (!Number.isInteger(sampleLimit) || sampleLimit < 2) {
      throw new RangeError("Vision diagnostics require at least two samples.");
    }
  }

  record(
    frame: VisionLandmarkFrame,
    scheduler: LatestFrameSchedulerStats,
  ): VisionDiagnosticsSnapshot {
    const assessment = assessVisionTracking(frame);
    this.completedFrames += 1;
    this.samples.push({
      completedAtMs: frame.completedAtMs,
      inferenceMs: frame.timing.poseMs + frame.timing.handsMs,
      captureToResultMs: frame.timing.totalMs,
    });
    if (this.samples.length > this.sampleLimit) {
      this.samples.shift();
    }

    return {
      ...this.snapshot(scheduler),
      presence: assessment.presence,
      framing: assessment.framing,
      trackingQuality: assessment.score,
      trackingBand: assessment.band,
      poseVisibility: assessment.poseVisibility,
      inFrameCoverage: assessment.inFrameCoverage,
      handsDetected: assessment.handsDetected,
      upperBodyScale: assessment.upperBodyScale,
    };
  }

  snapshot(
    scheduler: LatestFrameSchedulerStats,
  ): VisionDiagnosticsSnapshot {
    const inference = this.samples.map((sample) => sample.inferenceMs);
    const latency = this.samples.map((sample) => sample.captureToResultMs);
    const first = this.samples[0];
    const last = this.samples.at(-1);
    const elapsedMs =
      first && last ? last.completedAtMs - first.completedAtMs : 0;
    const effectiveFps =
      this.samples.length > 1 && elapsedMs > 0
        ? ((this.samples.length - 1) * 1000) / elapsedMs
        : 0;

    return {
      completedFrames: this.completedFrames,
      effectiveFps,
      latestInferenceMs: inference.at(-1) ?? 0,
      inferenceP50Ms: percentile(inference, 0.5),
      inferenceP95Ms: percentile(inference, 0.95),
      captureToResultP50Ms: percentile(latency, 0.5),
      captureToResultP95Ms: percentile(latency, 0.95),
      submittedFrames: scheduler.submitted,
      sentFrames: scheduler.sent,
      replacedFrames: scheduler.replaced,
      rejectedFrames: scheduler.rejected,
      replacementRate:
        scheduler.submitted > 0
          ? scheduler.replaced / scheduler.submitted
          : 0,
      inFlight: scheduler.inFlight,
      pending: scheduler.pending,
      presence: false,
      framing: "absent",
      trackingQuality: 0,
      trackingBand: "lost",
      poseVisibility: 0,
      inFrameCoverage: 0,
      handsDetected: 0,
      upperBodyScale: 0,
    };
  }
}

function percentile(values: readonly number[], proportion: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil(proportion * sorted.length) - 1;
  return sorted[Math.max(0, index)] ?? 0;
}
