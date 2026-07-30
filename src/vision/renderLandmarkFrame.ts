import {
  DrawingUtils,
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type { VisionLandmarkFrame } from "./visionTypes";

const POSE_CONNECTOR_COLOUR = "rgba(243, 204, 126, 0.85)";
const POSE_LANDMARK_COLOUR = "#6ed3a0";
const HAND_CONNECTOR_COLOUR = "rgba(90, 210, 244, 0.9)";
const HAND_LANDMARK_COLOUR = "#ff7ad9";

export function renderLandmarkFrame(
  frame: VisionLandmarkFrame,
  context: CanvasRenderingContext2D,
): void {
  const { canvas } = context;
  const drawingUtils = new DrawingUtils(context);
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (frame.pose) {
    drawingUtils.drawConnectors(
      [...frame.pose.landmarks],
      PoseLandmarker.POSE_CONNECTIONS,
      { color: POSE_CONNECTOR_COLOUR, lineWidth: 3 },
    );
    drawingUtils.drawLandmarks([...frame.pose.landmarks], {
      color: POSE_LANDMARK_COLOUR,
      radius: 3,
    });
  }

  for (const hand of frame.hands) {
    drawingUtils.drawConnectors(
      [...hand.landmarks],
      HandLandmarker.HAND_CONNECTIONS,
      { color: HAND_CONNECTOR_COLOUR, lineWidth: 2 },
    );
    drawingUtils.drawLandmarks([...hand.landmarks], {
      color: HAND_LANDMARK_COLOUR,
      radius: 2,
    });
  }
}
