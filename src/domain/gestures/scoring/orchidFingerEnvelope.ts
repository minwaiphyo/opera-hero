import type { Vector2 } from "../features/geometry";
import type { OrchidFingerName, OrchidFingerHandFeatures } from "../features/orchidFingerFeatures";
import type { OrchidFingerTrajectory, OrchidFingerTrajectorySample } from "../features/orchidFingerTrajectory";
import type { ScalarEnvelopeValue, VectorEnvelopeValue } from "./waterSleevesEnvelope";

export const ORCHID_FINGER_REFERENCE_SCHEMA_VERSION = 1 as const;
export const ORCHID_FINGER_REFERENCE_POINTS = 41;
export const ORCHID_FINGER_POSITION_TOLERANCE = 0.45;
export const ORCHID_FINGER_DIRECTION_TOLERANCE_RAD = Math.PI / 4;
export const ORCHID_FINGER_SHAPE_TOLERANCE = 0.6;

type NonThumbFinger = Exclude<OrchidFingerName, "thumb">;
const FINGERS: readonly OrchidFingerName[] = ["thumb", "index", "middle", "ring", "pinky"];
const NON_THUMB_FINGERS: readonly NonThumbFinger[] = ["index", "middle", "ring", "pinky"];

export interface OrchidFingerHandEnvelope {
  palmPosition: VectorEnvelopeValue;
  palmDirection: ScalarEnvelopeValue;
  fingerExtension: Record<OrchidFingerName, ScalarEnvelopeValue>;
  fingerCurlRad: Record<NonThumbFinger, ScalarEnvelopeValue>;
  thumbToFingertip: Record<NonThumbFinger, ScalarEnvelopeValue>;
}
export interface OrchidFingerEnvelopePoint {
  progress: number;
  leftElbowPosition: VectorEnvelopeValue | null;
  rightElbowPosition: VectorEnvelopeValue | null;
  leftWristPosition: VectorEnvelopeValue | null;
  rightWristPosition: VectorEnvelopeValue | null;
  leftHand: OrchidFingerHandEnvelope | null;
  rightHand: OrchidFingerHandEnvelope | null;
}
export interface OrchidFingerReferenceEnvelope {
  schemaVersion: typeof ORCHID_FINGER_REFERENCE_SCHEMA_VERSION;
  gestureId: "orchid-finger";
  sourceFixtureIds: readonly string[];
  derivedFromRecordedImagery: true;
  containsRecordedImagery: false;
  progressPoints: number;
  smoothingWindow: number;
  tolerances: { positionShoulderWidths: number; palmDirectionRad: number; handShape: number };
  points: readonly OrchidFingerEnvelopePoint[];
}

export function buildOrchidFingerReferenceEnvelope(trajectories: readonly OrchidFingerTrajectory[], progressPoints = ORCHID_FINGER_REFERENCE_POINTS): OrchidFingerReferenceEnvelope {
  if (!trajectories.length) throw new Error("Orchid Finger requires at least one reference trajectory.");
  if (progressPoints < 2) throw new Error("An Orchid Finger envelope requires at least two progress points.");
  const smoothingWindow = 1 / (progressPoints - 1);
  const points = Array.from({ length: progressPoints }, (_, index) => {
    const progress = index / (progressPoints - 1);
    const samples = referenceSamples(trajectories, progress, smoothingWindow);
    return {
      progress,
      leftElbowPosition: vectorValue(samples, (s) => s.leftArm?.elbowFromShoulder), rightElbowPosition: vectorValue(samples, (s) => s.rightArm?.elbowFromShoulder),
      leftWristPosition: vectorValue(samples, (s) => s.leftArm?.wristFromShoulder), rightWristPosition: vectorValue(samples, (s) => s.rightArm?.wristFromShoulder),
      leftHand: handValue(samples, (s) => s.leftHand), rightHand: handValue(samples, (s) => s.rightHand),
    };
  });
  return { schemaVersion: 1, gestureId: "orchid-finger", sourceFixtureIds: trajectories.map(({ fixtureId }) => fixtureId), derivedFromRecordedImagery: true, containsRecordedImagery: false, progressPoints, smoothingWindow, tolerances: { positionShoulderWidths: ORCHID_FINGER_POSITION_TOLERANCE, palmDirectionRad: ORCHID_FINGER_DIRECTION_TOLERANCE_RAD, handShape: ORCHID_FINGER_SHAPE_TOLERANCE }, points };
}

function referenceSamples(trajectories: readonly OrchidFingerTrajectory[], progress: number, window: number) {
  return trajectories.flatMap(({ samples }) => {
    const nearby = samples.filter((sample) => Math.abs(sample.progress - progress) <= window);
    if (nearby.length) return nearby;
    const nearest = [...samples].sort((a, b) => Math.abs(a.progress - progress) - Math.abs(b.progress - progress))[0];
    return nearest ? [nearest] : [];
  });
}
function vectorValue(samples: readonly OrchidFingerTrajectorySample[], select: (sample: OrchidFingerTrajectorySample) => Vector2 | null | undefined): VectorEnvelopeValue | null {
  const values = samples.map(select).filter((value): value is Vector2 => value != null);
  return values.length ? { target: { x: median(values.map(({ x }) => x)), y: median(values.map(({ y }) => y)) }, tolerance: ORCHID_FINGER_POSITION_TOLERANCE } : null;
}
function handValue(samples: readonly OrchidFingerTrajectorySample[], select: (sample: OrchidFingerTrajectorySample) => OrchidFingerHandFeatures | null): OrchidFingerHandEnvelope | null {
  const hands = samples.map(select).filter((hand): hand is OrchidFingerHandFeatures => hand != null);
  if (!hands.length) return null;
  const scalar = (values: readonly number[], tolerance = ORCHID_FINGER_SHAPE_TOLERANCE) => ({ target: median(values), tolerance });
  const record = <K extends string>(keys: readonly K[], value: (hand: OrchidFingerHandFeatures, key: K) => number) => Object.fromEntries(keys.map((key) => [key, scalar(hands.map((hand) => value(hand, key)))])) as Record<K, ScalarEnvelopeValue>;
  const sine = hands.reduce((sum, hand) => sum + Math.sin(hand.palmDirectionRad), 0);
  const cosine = hands.reduce((sum, hand) => sum + Math.cos(hand.palmDirectionRad), 0);
  return {
    palmPosition: { target: { x: median(hands.map((h) => h.palmCenterFromBody.x)), y: median(hands.map((h) => h.palmCenterFromBody.y)) }, tolerance: ORCHID_FINGER_POSITION_TOLERANCE },
    palmDirection: { target: Math.atan2(sine, cosine), tolerance: ORCHID_FINGER_DIRECTION_TOLERANCE_RAD },
    fingerExtension: record(FINGERS, (hand, key) => hand.fingerExtension[key]),
    fingerCurlRad: record(NON_THUMB_FINGERS, (hand, key) => hand.fingerCurlRad[key]),
    thumbToFingertip: record(NON_THUMB_FINGERS, (hand, key) => hand.thumbToFingertip[key]),
  };
}
function median(values: readonly number[]) { const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2; }
