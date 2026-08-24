import type { VisionLandmark } from "../../vision/visionTypes";
import type { OverlayProjection } from "./overlayPainter";

const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const MIN_VISIBILITY = 0.55;
const SHOULDER_WIDTH_SCALE = 1.55;
const HEAD_TO_SHOULDER_SCALE = 2;
const VERTICAL_ANCHOR_SCALE = 0.9;
export const COSTUME_TRACKING_GRACE_MS = 400;
const PLACEMENT_SMOOTHING = 0.35;

export interface CostumePlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CostumeTrackingState {
  placement: CostumePlacement;
  lastReliableAt: number;
}

/**
 * Smooths small landmark shifts and bridges isolated low-confidence frames.
 * Four tenths of a second is long enough to prevent a blink, but short enough for the
 * costume to disappear promptly when the visitor actually leaves the mirror.
 */
export function updateCostumeTracking(
  previous: CostumeTrackingState | null,
  detected: CostumePlacement | null,
  now: number,
): CostumeTrackingState | null {
  if (detected) {
    return {
      placement: previous
        ? interpolatePlacement(previous.placement, detected, PLACEMENT_SMOOTHING)
        : detected,
      lastReliableAt: now,
    };
  }

  return previous && now - previous.lastReliableAt <= COSTUME_TRACKING_GRACE_MS
    ? previous
    : null;
}

/**
 * Fits the transparent Dan-inspired headpiece and mantle around the visitor.
 *
 * The art is square. Its face opening is centred above the mantle, so the shoulder
 * midpoint provides a steadier anchor than the head alone while the nose keeps the
 * scale useful when somebody turns slightly. Returning null makes tracking loss a calm
 * disappearance rather than leaving a costume floating in the mirror.
 */
export function calculateCostumePlacement(
  landmarks: readonly VisionLandmark[],
  projection: OverlayProjection,
): CostumePlacement | null {
  const nose = landmarks[NOSE];
  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];
  if (
    !visible(nose) ||
    !visible(leftShoulder) ||
    !visible(rightShoulder)
  ) {
    return null;
  }

  const leftX = projection.toX(leftShoulder.x);
  const rightX = projection.toX(rightShoulder.x);
  const shoulderY =
    (projection.toY(leftShoulder.y) + projection.toY(rightShoulder.y)) / 2;
  const noseY = projection.toY(nose.y);
  const shoulderSpan = Math.abs(rightX - leftX);
  const headToShoulder = Math.max(0, shoulderY - noseY);
  if (shoulderSpan < 1 || headToShoulder < 1) {
    return null;
  }

  // Keep a modest theatrical silhouette without letting the mantle overwhelm the
  // visitor. The head-to-shoulder fallback also keeps the face opening snug when an
  // angled visitor's apparent shoulder width narrows.
  const width = Math.max(
    shoulderSpan * SHOULDER_WIDTH_SCALE,
    headToShoulder * HEAD_TO_SHOULDER_SCALE,
  );
  const centreX = (leftX + rightX) / 2;

  return {
    x: centreX - width / 2,
    y: shoulderY - width * VERTICAL_ANCHOR_SCALE,
    width,
    height: width,
  };
}

export function paintCostumeOverlay(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  landmarks: readonly VisionLandmark[],
  projection: OverlayProjection,
): boolean {
  const placement = calculateCostumePlacement(landmarks, projection);
  if (!placement) {
    return false;
  }

  paintCostumePlacement(context, image, placement, projection.scale);
  return true;
}

export function paintCostumePlacement(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  placement: CostumePlacement,
  scale: number,
): void {

  context.save();
  context.globalAlpha = 0.94;
  context.shadowBlur = 12 * scale;
  context.shadowColor = "rgba(228, 184, 95, 0.42)";
  context.drawImage(
    image,
    placement.x,
    placement.y,
    placement.width,
    placement.height,
  );
  context.restore();
}

function interpolatePlacement(
  previous: CostumePlacement,
  next: CostumePlacement,
  amount: number,
): CostumePlacement {
  return {
    x: interpolate(previous.x, next.x, amount),
    y: interpolate(previous.y, next.y, amount),
    width: interpolate(previous.width, next.width, amount),
    height: interpolate(previous.height, next.height, amount),
  };
}

function interpolate(previous: number, next: number, amount: number): number {
  return previous + (next - previous) * amount;
}

function visible(point: VisionLandmark | undefined): point is VisionLandmark {
  return Boolean(point && point.visibility >= MIN_VISIBILITY);
}
