import type { VisionLandmark } from "../../../vision/visionTypes";

export interface Vector2 {
  x: number;
  y: number;
}

export function distance(a: VisionLandmark, b: VisionLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalizedOffset(
  origin: VisionLandmark,
  point: VisionLandmark,
  scale: number,
): Vector2 {
  return {
    x: (point.x - origin.x) / scale,
    // Image coordinates grow downwards; feature coordinates grow upwards.
    y: (origin.y - point.y) / scale,
  };
}

export function angleOf(vector: Vector2): number {
  return Math.atan2(vector.y, vector.x);
}

export function jointAngle(
  start: VisionLandmark,
  joint: VisionLandmark,
  end: VisionLandmark,
): number | null {
  const first = { x: start.x - joint.x, y: start.y - joint.y };
  const second = { x: end.x - joint.x, y: end.y - joint.y };
  const denominator = Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);
  if (denominator <= Number.EPSILON) {
    return null;
  }
  const cosine = Math.max(
    -1,
    Math.min(1, (first.x * second.x + first.y * second.y) / denominator),
  );
  return Math.acos(cosine);
}
