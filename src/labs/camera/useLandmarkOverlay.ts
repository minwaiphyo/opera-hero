import { useEffect, useRef, useState, type RefObject } from "react";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import { renderLandmarkFrame } from "../../vision/renderLandmarkFrame";
import { calculateVisionCaptureSize } from "../../vision/visionCapture";
import {
  EMPTY_VISION_DIAGNOSTICS,
  VisionDiagnosticsAccumulator,
  type VisionDiagnosticsSnapshot,
} from "../../vision/visionDiagnostics";
import {
  createVisionWorker,
  VisionWorkerClient,
  type VisionWorkerState,
} from "../../vision/visionWorkerClient";

export interface LandmarkOverlayState {
  worker: VisionWorkerState;
  diagnostics: VisionDiagnosticsSnapshot;
}

/**
 * Captures transferable video frames, delegates inference to the vision worker,
 * and paints the normalized results returned to the main thread.
 */
export function useLandmarkOverlay(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
  onFrame?: (frame: VisionLandmarkFrame) => void,
): LandmarkOverlayState {
  const onFrameRef = useRef(onFrame);
  const [state, setState] = useState<LandmarkOverlayState>({
    worker: { status: "loading" },
    diagnostics: EMPTY_VISION_DIAGNOSTICS,
  });

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") ?? null;
    if (!enabled || !video || !canvas || !context) {
      return;
    }

    let cancelled = false;
    let frameHandle = 0;
    let nextFrameId = 0;
    let lastVideoTime = -1;
    let capturePending = false;
    let lastDiagnosticsPublishedAt = 0;
    const diagnostics = new VisionDiagnosticsAccumulator();
    const client = new VisionWorkerClient(createVisionWorker(), {
      onStateChange: (nextState) => {
        if (!cancelled) {
          setState((current) => ({ ...current, worker: nextState }));
        }
      },
      onFrame: (frame) => {
        if (!cancelled) {
          drawFrame(frame, canvas, context);
          onFrameRef.current?.(frame);
          const snapshot = diagnostics.record(frame, client.getStats());
          const now = performance.now();
          if (now - lastDiagnosticsPublishedAt >= 250) {
            lastDiagnosticsPublishedAt = now;
            setState((current) => ({
              ...current,
              diagnostics: snapshot,
            }));
          }
        }
      },
    });

    const captureFrame = () => {
      frameHandle = requestAnimationFrame(captureFrame);
      if (
        !client.isReady() ||
        capturePending ||
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.currentTime === lastVideoTime
      ) {
        return;
      }

      lastVideoTime = video.currentTime;
      capturePending = true;
      const frameId = nextFrameId++;
      // performance.now() is relative to the current execution context. A
      // worker can have a different time origin, so carry an epoch-relative
      // high-resolution timestamp across the thread boundary.
      const capturedAtMs = performance.timeOrigin + performance.now();
      const captureSize = calculateVisionCaptureSize(
        video.videoWidth,
        video.videoHeight,
      );

      void createImageBitmap(video, {
        resizeWidth: captureSize.width,
        resizeHeight: captureSize.height,
        resizeQuality: "low",
      })
        .then((bitmap) => {
          if (cancelled) {
            bitmap.close();
            return;
          }
          client.submit({ frameId, capturedAtMs, bitmap });
        })
        .catch(() => {
          if (!cancelled) {
            setState((current) => ({
              ...current,
              worker: {
                status: "error",
                message:
                  "The camera frame could not be transferred to the worker.",
              },
            }));
          }
        })
        .finally(() => {
          capturePending = false;
        });
    };

    setState({
      worker: { status: "loading" },
      diagnostics: EMPTY_VISION_DIAGNOSTICS,
    });
    frameHandle = requestAnimationFrame(captureFrame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameHandle);
      client.dispose();
      context.clearRect(0, 0, canvas.width, canvas.height);
      setState({
        worker: { status: "loading" },
        diagnostics: EMPTY_VISION_DIAGNOSTICS,
      });
    };
  }, [canvasRef, enabled, videoRef]);

  return enabled
    ? state
    : {
        worker: { status: "idle" },
        diagnostics: EMPTY_VISION_DIAGNOSTICS,
      };
}

function drawFrame(
  frame: VisionLandmarkFrame,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): void {
  const video = canvas.previousElementSibling;
  if (video instanceof HTMLVideoElement) {
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }
  renderLandmarkFrame(frame, context);
}
