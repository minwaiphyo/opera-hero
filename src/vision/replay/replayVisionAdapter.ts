import type {
  VisionAdapter,
  VisionAdapterSnapshot,
  VisionAdapterStateListener,
  VisionFrameListener,
} from "../visionAdapter";
import type { VisionLandmarkFrame } from "../visionTypes";
import {
  browserReplayClock,
  type ReplayClock,
  type ReplayTimerHandle,
} from "./replayClock";
import type { VisionReplayFixture, VisionReplayFrame } from "./visionReplayTypes";
import { parseVisionReplayFixture } from "./visionReplayValidation";

export type ReplayAdapterStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "disposed";

export interface ReplayAdapterSnapshot extends VisionAdapterSnapshot {
  kind: "replay";
  status: ReplayAdapterStatus;
  fixtureId: string;
  positionMs: number;
  durationMs: number;
  playbackRate: number;
  emittedFrames: number;
}

export class ReplayVisionAdapter implements VisionAdapter {
  readonly kind = "replay" as const;

  private readonly fixture: VisionReplayFixture;
  private readonly frameListeners = new Set<VisionFrameListener>();
  private readonly stateListeners = new Set<VisionAdapterStateListener>();
  private status: ReplayAdapterStatus = "idle";
  private playbackRate = 1;
  private positionMs = 0;
  private anchorPositionMs = 0;
  private anchorTimeMs = 0;
  private nextFrameIndex = 0;
  private emittedFrames = 0;
  private timer: ReplayTimerHandle | null = null;

  constructor(
    fixture: unknown,
    private readonly clock: ReplayClock = browserReplayClock,
  ) {
    this.fixture = parseVisionReplayFixture(fixture);
  }

  start(): void {
    this.assertActive();
    if (this.status === "running") {
      return;
    }
    if (this.status === "completed") {
      this.resetPosition();
    }

    this.status = "running";
    this.anchorPositionMs = this.positionMs;
    this.anchorTimeMs = this.clock.now();
    this.emitState();
    this.scheduleNextFrame();
  }

  pause(): void {
    this.assertActive();
    if (this.status !== "running") {
      return;
    }

    this.updatePosition();
    this.clearScheduledFrame();
    this.status = "paused";
    this.emitState();
  }

  restart(): void {
    this.assertActive();
    this.clearScheduledFrame();
    this.resetPosition();
    this.status = "running";
    this.anchorTimeMs = this.clock.now();
    this.emitState();
    this.scheduleNextFrame();
  }

  setPlaybackRate(playbackRate: number): void {
    this.assertActive();
    if (
      !Number.isFinite(playbackRate) ||
      playbackRate < 0.25 ||
      playbackRate > 4
    ) {
      throw new RangeError("Replay speed must be between 0.25x and 4x.");
    }

    const wasRunning = this.status === "running";
    if (wasRunning) {
      this.updatePosition();
      this.clearScheduledFrame();
    }
    this.playbackRate = playbackRate;
    this.anchorPositionMs = this.positionMs;
    this.anchorTimeMs = this.clock.now();
    this.emitState();
    if (wasRunning) {
      this.scheduleNextFrame();
    }
  }

  stop(): void {
    if (this.status === "disposed") {
      return;
    }
    this.clearScheduledFrame();
    this.resetPosition();
    this.status = "idle";
    this.emitState();
  }

  getSnapshot(): ReplayAdapterSnapshot {
    return {
      kind: "replay",
      status: this.status,
      fixtureId: this.fixture.id,
      positionMs: this.currentPosition(),
      durationMs: this.durationMs,
      playbackRate: this.playbackRate,
      emittedFrames: this.emittedFrames,
    };
  }

  subscribeFrames(listener: VisionFrameListener): () => void {
    this.assertActive();
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }

  subscribeState(listener: VisionAdapterStateListener): () => void {
    this.assertActive();
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  dispose(): void {
    if (this.status === "disposed") {
      return;
    }
    this.clearScheduledFrame();
    this.status = "disposed";
    this.emitState();
    this.frameListeners.clear();
    this.stateListeners.clear();
  }

  private scheduleNextFrame(): void {
    if (this.status !== "running") {
      return;
    }
    const frame = this.fixture.frames[this.nextFrameIndex];
    if (!frame) {
      this.positionMs = this.durationMs;
      this.status = "completed";
      this.emitState();
      return;
    }

    const delayMs = Math.max(
      0,
      (frame.offsetMs - this.currentPosition()) / this.playbackRate,
    );
    this.timer = this.clock.setTimer(() => {
      this.timer = null;
      const frameIndex = this.nextFrameIndex;
      this.nextFrameIndex += 1;
      this.emittedFrames += 1;
      this.positionMs = frame.offsetMs;
      this.anchorPositionMs = this.positionMs;
      this.anchorTimeMs = this.clock.now();
      this.emitFrame(frame, frameIndex);
      this.scheduleNextFrame();
    }, delayMs);
  }

  private emitFrame(frame: VisionReplayFrame, frameId: number): void {
    const normalizedFrame: VisionLandmarkFrame = {
      frameId,
      capturedAtMs: frame.offsetMs,
      completedAtMs: frame.offsetMs,
      ...(frame.pose ? { pose: frame.pose } : {}),
      hands: frame.hands,
      timing: { poseMs: 0, handsMs: 0, totalMs: 0 },
    };
    for (const listener of this.frameListeners) {
      listener(normalizedFrame);
    }
  }

  private emitState(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.stateListeners) {
      listener(snapshot);
    }
  }

  private updatePosition(): void {
    this.positionMs = this.currentPosition();
    this.anchorPositionMs = this.positionMs;
    this.anchorTimeMs = this.clock.now();
  }

  private currentPosition(): number {
    if (this.status !== "running") {
      return this.positionMs;
    }
    const elapsed = Math.max(0, this.clock.now() - this.anchorTimeMs);
    return Math.min(
      this.durationMs,
      this.anchorPositionMs + elapsed * this.playbackRate,
    );
  }

  private resetPosition(): void {
    this.positionMs = 0;
    this.anchorPositionMs = 0;
    this.nextFrameIndex = 0;
    this.emittedFrames = 0;
  }

  private clearScheduledFrame(): void {
    if (this.timer !== null) {
      this.clock.clearTimer(this.timer);
      this.timer = null;
    }
  }

  private assertActive(): void {
    if (this.status === "disposed") {
      throw new Error("Replay adapter has been disposed.");
    }
  }

  private get durationMs(): number {
    return this.fixture.frames.at(-1)?.offsetMs ?? 0;
  }
}
