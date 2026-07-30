import { useEffect, useState, type RefObject } from "react";
import {
  DrawingUtils,
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import {
  createVisionWorker,
  VisionWorkerClient,
  type VisionWorkerState,
} from "../../vision/visionWorkerClient";

export type LandmarkOverlayState = VisionWorkerState;

const POSE_CONNECTOR_COLOUR = "rgba(243, 204, 126, 0.85)";
const POSE_LANDMARK_COLOUR = "#6ed3a0";
const POSE_CONNECTOR_WIDTH = 3;
const POSE_LANDMARK_RADIUS = 3;
const HAND_CONNECTOR_COLOUR = "rgba(90, 210, 244, 0.9)";
const HAND_LANDMARK_COLOUR = "#ff7ad9";
const HAND_CONNECTOR_WIDTH = 2;
const HAND_LANDMARK_RADIUS = 2;

/**
 * Captures transferable video frames, delegates inference to the vision worker,
 * and paints the normalized results returned to the main thread.
 */
export function useLandmarkOverlay(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
): LandmarkOverlayState {
  const [state, setState] = useState<LandmarkOverlayState>({ status: "loading" });

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
    const drawingUtils = new DrawingUtils(context);
    const client = new VisionWorkerClient(createVisionWorker(), {
      onStateChange: (nextState) => {
        if (!cancelled) {
          setState(nextState);
        }
      },
      onFrame: (frame) => {
        if (!cancelled) {
          drawFrame(frame, canvas, context, drawingUtils);
        }
      },
    });

    const captureFrame = () => {
      frameHandle = requestAnimationFrame(captureFrame);
      if (
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

      void createImageBitmap(video)
        .then((bitmap) => {
          if (cancelled) {
            bitmap.close();
            return;
          }
          client.submit({ frameId, capturedAtMs, bitmap });
        })
        .catch(() => {
          if (!cancelled) {
            setState({
              status: "error",
              message: "The camera frame could not be transferred to the worker.",
            });
          }
        })
        .finally(() => {
          capturePending = false;
        });
    };

    setState({ status: "loading" });
    frameHandle = requestAnimationFrame(captureFrame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameHandle);
      client.dispose();
      context.clearRect(0, 0, canvas.width, canvas.height);
      setState({ status: "loading" });
    };
  }, [canvasRef, enabled, videoRef]);

  return enabled ? state : { status: "idle" };
}

function drawFrame(
  frame: VisionLandmarkFrame,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  drawingUtils: DrawingUtils,
): void {
  const video = canvas.previousElementSibling;
  if (video instanceof HTMLVideoElement) {
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (frame.pose) {
    drawingUtils.drawConnectors(
      [...frame.pose.landmarks],
      PoseLandmarker.POSE_CONNECTIONS,
      { color: POSE_CONNECTOR_COLOUR, lineWidth: POSE_CONNECTOR_WIDTH },
    );
    drawingUtils.drawLandmarks([...frame.pose.landmarks], {
      color: POSE_LANDMARK_COLOUR,
      radius: POSE_LANDMARK_RADIUS,
    });
  }

  for (const hand of frame.hands) {
    drawingUtils.drawConnectors(
      [...hand.landmarks],
      HandLandmarker.HAND_CONNECTIONS,
      { color: HAND_CONNECTOR_COLOUR, lineWidth: HAND_CONNECTOR_WIDTH },
    );
    drawingUtils.drawLandmarks([...hand.landmarks], {
      color: HAND_LANDMARK_COLOUR,
      radius: HAND_LANDMARK_RADIUS,
    });
  }
}
