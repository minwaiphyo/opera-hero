import type {
  LandmarkFrame,
  VisionCapabilities,
  VisionFrameInput,
} from "./landmarkTypes";

export interface VisionAdapter {
  initialize(): Promise<VisionCapabilities>;
  process(frame: VisionFrameInput): Promise<LandmarkFrame>;
  dispose(): Promise<void>;
}

export type VisionAdapterFactory = () => VisionAdapter;
