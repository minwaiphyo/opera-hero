import { useEffect, useState, type RefObject } from "react";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";
import { createPoseDetector } from "../../lib/poseDetector";

export type PoseOverlayStatus = "idle" | "loading" | "tracking" | "error";

const CONNECTOR_COLOUR = "rgba(243, 204, 126, 0.85)";
const LANDMARK_COLOUR = "#6ed3a0";
const CONNECTOR_WIDTH = 3;
const LANDMARK_RADIUS = 3;

/**
 * Runs pose detection against a live <video> and paints the skeleton onto an
 * overlay <canvas>. Detection is read-only: nothing is persisted or uploaded.
 */
export function usePoseOverlay(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
): PoseOverlayStatus {
  const [status, setStatus] = useState<PoseOverlayStatus>("loading");

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // A missing 2D context means no environment to draw into (jsdom, for
    // one), so the overlay stays dormant rather than failing the preview.
    const context = canvas?.getContext("2d") ?? null;
    if (!enabled || !video || !canvas || !context) {
      return;
    }

    let cancelled = false;
    let detector: PoseLandmarker | null = null;
    let frameHandle = 0;
    let lastVideoTime = -1;
    const drawingUtils = new DrawingUtils(context);

    const renderFrame = () => {
      frameHandle = requestAnimationFrame(renderFrame);

      if (!detector || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      // rAF usually outruns the camera. Redrawing only on a fresh video frame
      // keeps the skeleton from flickering between capture intervals.
      if (video.currentTime === lastVideoTime) {
        return;
      }
      lastVideoTime = video.currentTime;

      // The backing store matches the source frame, so MediaPipe's normalized
      // landmarks map straight onto it with no extra scaling.
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      try {
        const result = detector.detectForVideo(video, performance.now());
        for (const landmarks of result.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            PoseLandmarker.POSE_CONNECTIONS,
            { color: CONNECTOR_COLOUR, lineWidth: CONNECTOR_WIDTH },
          );
          drawingUtils.drawLandmarks(landmarks, {
            color: LANDMARK_COLOUR,
            radius: LANDMARK_RADIUS,
          });
        }
      } catch {
        // A single dropped frame is not worth tearing the loop down for.
      }
    };

    void createPoseDetector()
      .then((created) => {
        if (cancelled) {
          // StrictMode ran the effect twice; this instance is already orphaned.
          created.close();
          return;
        }
        detector = created;
        setStatus("tracking");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    frameHandle = requestAnimationFrame(renderFrame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameHandle);
      detector?.close();
      detector = null;
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Reset so the next camera session starts from "loading" instead of
      // showing the previous session's terminal state.
      setStatus("loading");
    };
  }, [canvasRef, enabled, videoRef]);

  return enabled ? status : "idle";
}
