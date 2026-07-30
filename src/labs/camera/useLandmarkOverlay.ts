import { useEffect, useState, type RefObject } from "react";
import {
  DrawingUtils,
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { createHandDetector } from "../../lib/handDetector";
import { createPoseDetector } from "../../lib/poseDetector";

export type LandmarkOverlayStatus = "idle" | "loading" | "tracking" | "error";

/**
 * Warm gold body, cool cyan hands. The two skeletons meet at the wrist, so
 * they are separated by hue rather than by shape, and the hand joints are
 * drawn smaller because 21 points per hand crowd quickly at arm's length.
 */
const POSE_CONNECTOR_COLOUR = "rgba(243, 204, 126, 0.85)";
const POSE_LANDMARK_COLOUR = "#6ed3a0";
const POSE_CONNECTOR_WIDTH = 3;
const POSE_LANDMARK_RADIUS = 3;

const HAND_CONNECTOR_COLOUR = "rgba(90, 210, 244, 0.9)";
const HAND_LANDMARK_COLOUR = "#ff7ad9";
const HAND_CONNECTOR_WIDTH = 2;
const HAND_LANDMARK_RADIUS = 2;

/**
 * Runs pose and hand detection against a live <video> and paints both
 * skeletons onto an overlay <canvas>. Detection is read-only: nothing is
 * persisted or uploaded.
 */
export function useLandmarkOverlay(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
): LandmarkOverlayStatus {
  const [status, setStatus] = useState<LandmarkOverlayStatus>("loading");

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
    let poseDetector: PoseLandmarker | null = null;
    let handDetector: HandLandmarker | null = null;
    let frameHandle = 0;
    let lastVideoTime = -1;
    const drawingUtils = new DrawingUtils(context);

    const renderFrame = () => {
      frameHandle = requestAnimationFrame(renderFrame);

      if (
        !poseDetector ||
        !handDetector ||
        video.readyState < 2 ||
        video.videoWidth === 0
      ) {
        return;
      }

      // rAF usually outruns the camera. Redrawing only on a fresh video frame
      // keeps the skeletons from flickering between capture intervals.
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

      // Both graphs read the same frame, so they share one timestamp.
      const timestamp = performance.now();

      try {
        const pose = poseDetector.detectForVideo(video, timestamp);
        for (const landmarks of pose.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            PoseLandmarker.POSE_CONNECTIONS,
            { color: POSE_CONNECTOR_COLOUR, lineWidth: POSE_CONNECTOR_WIDTH },
          );
          drawingUtils.drawLandmarks(landmarks, {
            color: POSE_LANDMARK_COLOUR,
            radius: POSE_LANDMARK_RADIUS,
          });
        }

        // Drawn second so finger detail stays legible where the hand skeleton
        // overlaps the body skeleton at the wrist.
        const hands = handDetector.detectForVideo(video, timestamp);
        for (const landmarks of hands.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            HandLandmarker.HAND_CONNECTIONS,
            { color: HAND_CONNECTOR_COLOUR, lineWidth: HAND_CONNECTOR_WIDTH },
          );
          drawingUtils.drawLandmarks(landmarks, {
            color: HAND_LANDMARK_COLOUR,
            radius: HAND_LANDMARK_RADIUS,
          });
        }
      } catch {
        // A single dropped frame is not worth tearing the loop down for.
      }
    };

    void Promise.all([createPoseDetector(), createHandDetector()])
      .then(([pose, hand]) => {
        if (cancelled) {
          // StrictMode ran the effect twice; these instances are orphaned.
          pose.close();
          hand.close();
          return;
        }
        poseDetector = pose;
        handDetector = hand;
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
      poseDetector?.close();
      handDetector?.close();
      poseDetector = null;
      handDetector = null;
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Reset so the next camera session starts from "loading" instead of
      // showing the previous session's terminal state.
      setStatus("loading");
    };
  }, [canvasRef, enabled, videoRef]);

  return enabled ? status : "idle";
}
