import type { VisionLandmarkFrame } from "./visionTypes";

export type VisionAdapterKind = "live" | "replay";
export type VisionAdapterStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "error"
  | "disposed";

export interface VisionAdapterSnapshot {
  kind: VisionAdapterKind;
  status: VisionAdapterStatus;
}

export type VisionFrameListener = (frame: VisionLandmarkFrame) => void;
export type VisionAdapterStateListener = (
  snapshot: VisionAdapterSnapshot,
) => void;

/**
 * A normalized landmark source.
 *
 * Consumers subscribe to frames and lifecycle state without depending on a
 * camera, MediaPipe, worker, or replay implementation.
 */
export interface VisionAdapter {
  readonly kind: VisionAdapterKind;
  start(): void | Promise<void>;
  stop(): void;
  getSnapshot(): VisionAdapterSnapshot;
  subscribeFrames(listener: VisionFrameListener): () => void;
  subscribeState(listener: VisionAdapterStateListener): () => void;
  dispose(): void;
}
