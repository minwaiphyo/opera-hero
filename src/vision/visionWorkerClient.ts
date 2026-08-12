import {
  LatestFrameScheduler,
  type LatestFrameSchedulerStats,
  type SchedulableVisionFrame,
} from "./latestFrameScheduler";
import type { VisionLandmarkFrame } from "./visionTypes";
import {
  isVisionWorkerResponse,
  type PoseModelVariant,
  type VisionDelegate,
  type VisionWorkerConfiguration,
  type VisionWorkerRequest,
} from "./visionWorkerProtocol";

export type VisionWorkerState =
  | { status: "loading" }
  | {
      status: "tracking";
      delegate: VisionDelegate;
      poseModel: PoseModelVariant;
      runtimeVersion: string;
    }
  | { status: "error"; message: string }
  | { status: "idle" };

export interface WorkerPort {
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
  terminate(): void;
}

export interface VisionWorkerClientCallbacks {
  onFrame(frame: VisionLandmarkFrame): void;
  onStateChange(state: VisionWorkerState): void;
}

export const DEFAULT_VISION_WORKER_CONFIGURATION: VisionWorkerConfiguration = {
  poseModelPath: "/models/pose_landmarker_lite.task",
  handModelPath: "/models/hand_landmarker.task",
  poseModel: "lite",
  maxHands: 2,
  preferredDelegate: "GPU",
};

export class VisionWorkerClient {
  private readonly scheduler: LatestFrameScheduler;
  private disposed = false;
  private ready = false;

  constructor(
    private readonly worker: WorkerPort,
    private readonly callbacks: VisionWorkerClientCallbacks,
    configuration: VisionWorkerConfiguration =
      DEFAULT_VISION_WORKER_CONFIGURATION,
  ) {
    this.scheduler = new LatestFrameScheduler((request, transfer) => {
      this.worker.postMessage(request, transfer);
    });
    this.worker.onmessage = (event) => this.handleMessage(event.data);
    this.worker.onerror = () => {
      if (!this.disposed) {
        this.callbacks.onStateChange({
          status: "error",
          message: "The vision worker stopped unexpectedly.",
        });
      }
    };
    this.worker.postMessage({ type: "initialize", configuration } satisfies
      VisionWorkerRequest);
  }

  submit(frame: SchedulableVisionFrame): void {
    if (!this.ready) {
      frame.bitmap.close();
      return;
    }
    this.scheduler.submit(frame);
  }

  isReady(): boolean {
    return this.ready && !this.disposed;
  }

  getStats(): LatestFrameSchedulerStats {
    return this.scheduler.getStats();
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.ready = false;
    this.scheduler.dispose();
    this.worker.postMessage({ type: "dispose" } satisfies VisionWorkerRequest);
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.terminate();
    this.callbacks.onStateChange({ status: "idle" });
  }

  private handleMessage(value: unknown): void {
    if (this.disposed) {
      return;
    }
    if (!isVisionWorkerResponse(value)) {
      this.callbacks.onStateChange({
        status: "error",
        message: "The vision worker returned an invalid response.",
      });
      return;
    }

    if (value.type === "ready") {
      this.ready = true;
      // GPU falling back to CPU is the single biggest cause of lag reports on
      // weaker/integrated-graphics hardware; this is the only place that knows it.
      console.info(
        `[opera-hero] vision worker ready — delegate=${value.delegate} poseModel=${value.poseModel}`,
      );
      this.callbacks.onStateChange({
        status: "tracking",
        delegate: value.delegate,
        poseModel: value.poseModel,
        runtimeVersion: value.runtimeVersion,
      });
      return;
    }
    if (value.type === "result") {
      if (this.scheduler.complete(value.frame.frameId)) {
        this.callbacks.onFrame(value.frame);
      }
      return;
    }
    if (value.type === "error") {
      if (value.frameId !== undefined) {
        this.scheduler.complete(value.frameId);
      }
      if (
        value.code === "initialization-failed" ||
        value.code === "inference-failed"
      ) {
        if (value.code === "initialization-failed") {
          this.ready = false;
        }
        this.callbacks.onStateChange({
          status: "error",
          message: value.message,
        });
      }
    }
  }
}

export function createVisionWorker(): WorkerPort {
  return new Worker(new URL("./vision.worker.ts", import.meta.url), {
    type: "module",
    name: "opera-hero-vision",
  });
}
