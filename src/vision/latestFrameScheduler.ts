import type { VisionWorkerRequest } from "./visionWorkerProtocol";

export interface SchedulableVisionFrame {
  frameId: number;
  capturedAtMs: number;
  bitmap: ImageBitmap;
}

export interface LatestFrameSchedulerStats {
  submitted: number;
  sent: number;
  replaced: number;
  rejected: number;
  inFlight: boolean;
  pending: boolean;
}

type FrameRequest = Extract<VisionWorkerRequest, { type: "process-frame" }>;
type SendFrame = (
  request: FrameRequest,
  transfer: Transferable[],
) => void;

export class LatestFrameScheduler {
  private inFlightFrameId: number | null = null;
  private pendingFrame: SchedulableVisionFrame | null = null;
  private disposed = false;
  private counters = {
    submitted: 0,
    sent: 0,
    replaced: 0,
    rejected: 0,
  };

  constructor(private readonly sendFrame: SendFrame) {}

  submit(frame: SchedulableVisionFrame): void {
    this.counters.submitted += 1;

    if (this.disposed) {
      frame.bitmap.close();
      this.counters.rejected += 1;
      return;
    }

    if (this.inFlightFrameId === null) {
      this.dispatch(frame);
      return;
    }

    if (this.pendingFrame !== null) {
      this.pendingFrame.bitmap.close();
      this.counters.replaced += 1;
    }

    this.pendingFrame = frame;
  }

  complete(frameId: number): boolean {
    if (frameId !== this.inFlightFrameId) {
      return false;
    }

    this.inFlightFrameId = null;

    if (!this.disposed && this.pendingFrame !== null) {
      const nextFrame = this.pendingFrame;
      this.pendingFrame = null;
      this.dispatch(nextFrame);
    }

    return true;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    if (this.pendingFrame !== null) {
      this.pendingFrame.bitmap.close();
      this.pendingFrame = null;
      this.counters.rejected += 1;
    }
  }

  getStats(): LatestFrameSchedulerStats {
    return {
      ...this.counters,
      inFlight: this.inFlightFrameId !== null,
      pending: this.pendingFrame !== null,
    };
  }

  private dispatch(frame: SchedulableVisionFrame): void {
    this.inFlightFrameId = frame.frameId;
    this.counters.sent += 1;
    this.sendFrame(
      {
        type: "process-frame",
        frameId: frame.frameId,
        capturedAtMs: frame.capturedAtMs,
        bitmap: frame.bitmap,
      },
      [frame.bitmap],
    );
  }
}
