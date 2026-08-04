import type { VisionHand, VisionLandmarkFrame } from "../../../vision/visionTypes";

// Fingertips are intentionally excluded: their inference jitter is much larger
// than the stable wrist/knuckle structure even when a visitor is holding still.
const TRACKED_POINTS = [0, 5, 9, 13, 17] as const;

/** Hand-first frame motion for Orchid Finger capture completion. */
export function estimateOrchidFingerMotion(
  previous: VisionLandmarkFrame,
  current: VisionLandmarkFrame,
): number | null {
  const pairs = pairHands(previous.hands, current.hands);
  if (!pairs.length) return poseMotion(previous, current);
  const distances = pairs.flatMap(([before, after]) => {
    const palmScale = Math.max(0.001, distance(after.landmarks[0]!, after.landmarks[9]!));
    return TRACKED_POINTS.map((index) =>
      distance(before.landmarks[index]!, after.landmarks[index]!) / palmScale,
    );
  });
  return distances.reduce((sum, value) => sum + value, 0) / distances.length;
}

function poseMotion(previous: VisionLandmarkFrame, current: VisionLandmarkFrame) {
  const before = previous.pose?.landmarks;
  const after = current.pose?.landmarks;
  if (!before || !after) return null;
  const shoulderScale = distance(after[11]!, after[12]!);
  if (shoulderScale <= 0.001) return null;
  const indices = [13, 14, 15, 16];
  return indices.reduce((sum, index) => sum + distance(before[index]!, after[index]!) / shoulderScale, 0) / indices.length;
}

function pairHands(previous: readonly VisionHand[], current: readonly VisionHand[]) {
  const unused = new Set(current.map((_hand, index) => index));
  return previous.filter(valid).flatMap((before) => {
    const match = [...unused].map((index) => ({ index, hand: current[index]! }))
      .filter(({ hand }) => valid(hand))
      .sort((a, b) => distance(before.landmarks[0]!, a.hand.landmarks[0]!) - distance(before.landmarks[0]!, b.hand.landmarks[0]!))[0];
    if (!match) return [];
    unused.delete(match.index);
    return [[before, match.hand] as const];
  });
}
function valid(hand: VisionHand) { return hand.landmarks.length >= 21; }
function distance(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y); }
