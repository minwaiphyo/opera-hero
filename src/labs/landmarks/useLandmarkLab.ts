import { useCallback, useEffect, useRef, useState } from "react";
import { createFakeVisionAdapter } from "../../vision/fakeVisionAdapter";
import type {
  LandmarkFrame,
  VisionCapabilities,
} from "../../vision/landmarkTypes";
import type {
  VisionAdapter,
  VisionAdapterFactory,
} from "../../vision/visionAdapter";

export type LandmarkLabStatus =
  | "idle"
  | "initializing"
  | "running"
  | "stopped"
  | "error";

export type LandmarkLabState = {
  status: LandmarkLabStatus;
  capabilities: VisionCapabilities | null;
  latestFrame: LandmarkFrame | null;
  processedFrames: number;
  skippedFrames: number;
  error: string | null;
};

const INITIAL_STATE: LandmarkLabState = {
  status: "idle",
  capabilities: null,
  latestFrame: null,
  processedFrames: 0,
  skippedFrames: 0,
  error: null,
};

export function useLandmarkLab(
  adapterFactory: VisionAdapterFactory = createFakeVisionAdapter,
) {
  const [state, setState] = useState<LandmarkLabState>(INITIAL_STATE);
  const adapterRef = useRef<VisionAdapter | null>(null);
  const intervalRef = useRef<number | null>(null);
  const frameIdRef = useRef(0);
  const processingRef = useRef(false);
  const mountedRef = useRef(false);

  const clearProcessingInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const processNextFrame = useCallback(async () => {
    const adapter = adapterRef.current;
    if (!adapter || !mountedRef.current) {
      return;
    }
    if (processingRef.current) {
      setState((current) => ({
        ...current,
        skippedFrames: current.skippedFrames + 1,
      }));
      return;
    }

    processingRef.current = true;
    const frameId = ++frameIdRef.current;
    try {
      const frame = await adapter.process({
        frameId,
        timestampMs: performance.now(),
        width: 1280,
        height: 720,
      });
      if (mountedRef.current) {
        setState((current) => ({
          ...current,
          latestFrame: frame,
          processedFrames: current.processedFrames + 1,
        }));
      }
    } catch (error) {
      clearProcessingInterval();
      if (mountedRef.current) {
        setState((current) => ({
          ...current,
          status: "error",
          error: error instanceof Error ? error.message : "Vision processing failed.",
        }));
      }
    } finally {
      processingRef.current = false;
    }
  }, [clearProcessingInterval]);

  useEffect(() => {
    const adapter = adapterFactory();
    mountedRef.current = true;
    adapterRef.current = adapter;

    return () => {
      mountedRef.current = false;
      clearProcessingInterval();
      adapterRef.current = null;
      void adapter.dispose();
    };
  }, [adapterFactory, clearProcessingInterval]);

  const start = useCallback(async () => {
    const adapter = adapterRef.current;
    if (!adapter || intervalRef.current !== null) {
      return;
    }

    setState((current) => ({
      ...current,
      status: "initializing",
      error: null,
    }));
    try {
      const capabilities = await adapter.initialize();
      if (!mountedRef.current) {
        return;
      }
      setState((current) => ({
        ...current,
        status: "running",
        capabilities,
      }));
      await processNextFrame();
      intervalRef.current = window.setInterval(() => {
        void processNextFrame();
      }, 100);
    } catch (error) {
      if (mountedRef.current) {
        setState((current) => ({
          ...current,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Vision initialization failed.",
        }));
      }
    }
  }, [processNextFrame]);

  const stop = useCallback(() => {
    clearProcessingInterval();
    setState((current) => ({
      ...current,
      status: "stopped",
    }));
  }, [clearProcessingInterval]);

  return {
    ...state,
    start,
    stop,
  };
}
