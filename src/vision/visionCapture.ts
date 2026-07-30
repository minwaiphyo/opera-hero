export const VISION_INFERENCE_MAX_EDGE_PX = 640;

export interface VisionCaptureSize {
  width: number;
  height: number;
}

/**
 * Bounds the frame transferred to MediaPipe while preserving its aspect ratio.
 * The visible camera preview retains the camera's native resolution.
 */
export function calculateVisionCaptureSize(
  sourceWidth: number,
  sourceHeight: number,
  maxEdge = VISION_INFERENCE_MAX_EDGE_PX,
): VisionCaptureSize {
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    !Number.isFinite(maxEdge) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    maxEdge <= 0
  ) {
    throw new RangeError("Vision capture dimensions must be positive.");
  }

  const longestEdge = Math.max(sourceWidth, sourceHeight);
  const scale = Math.min(1, maxEdge / longestEdge);

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}
