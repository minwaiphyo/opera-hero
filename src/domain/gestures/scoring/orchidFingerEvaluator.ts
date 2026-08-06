import type { OrchidFingerTrajectory } from "../features/orchidFingerTrajectory";
import type { GestureEvaluation, GestureSignalScore, GestureTrackingStatus } from "./gestureScoringContract";
import type { OrchidFingerEnvelopePoint, OrchidFingerHandEnvelope, OrchidFingerReferenceEnvelope } from "./orchidFingerEnvelope";
import type { ScalarEnvelopeValue, VectorEnvelopeValue } from "./waterSleevesEnvelope";

export const ORCHID_FINGER_ALIGNMENT_WINDOW = 0.25;
export const ORCHID_FINGER_FULL_COVERAGE = 0.8;

export type OrchidFingerScoredSignal =
  | "leftElbowPosition" | "rightElbowPosition"
  | "leftWristPosition" | "rightWristPosition"
  | "leftPalmPosition" | "rightPalmPosition"
  | "leftPalmDirection" | "rightPalmDirection"
  | "leftHandShape" | "rightHandShape";
export interface OrchidFingerEvaluation
  extends GestureEvaluation<OrchidFingerScoredSignal> {
  movementCompleteness: number;
}

type PointScores = Record<OrchidFingerScoredSignal, number | null>;
interface AlignmentCell { cost: number; previous: [number, number] | null }

const SIGNAL_WEIGHTS: Record<OrchidFingerScoredSignal, number> = {
  leftElbowPosition: 0.7, rightElbowPosition: 0.7,
  leftWristPosition: 1, rightWristPosition: 1,
  leftPalmPosition: 0.5, rightPalmPosition: 0.5,
  leftPalmDirection: 0.35, rightPalmDirection: 0.35,
  leftHandShape: 1.25, rightHandShape: 1.25,
};
const SIGNALS = Object.keys(SIGNAL_WEIGHTS) as OrchidFingerScoredSignal[];

export function evaluateOrchidFingerTrajectory(trajectory: OrchidFingerTrajectory, reference: OrchidFingerReferenceEnvelope): OrchidFingerEvaluation {
  if (!trajectory.samples.length || !reference.points.length) return emptyEvaluation();
  const path = recoverPath(buildAlignmentMatrix(trajectory, reference));
  if (!path.length) return emptyEvaluation();
  const totals = Object.fromEntries(SIGNALS.map((signal) => [signal, { sum: 0, count: 0 }])) as Record<OrchidFingerScoredSignal, { sum: number; count: number }>;
  for (const [sampleIndex, referenceIndex] of path) {
    const scores = scorePoint(trajectory.samples[sampleIndex]!, reference.points[referenceIndex]!);
    for (const signal of SIGNALS) if (scores[signal] !== null) { totals[signal].sum += scores[signal]!; totals[signal].count += 1; }
  }
  const signalScores = Object.fromEntries(SIGNALS.map((signal) => [signal, { score: totals[signal].count ? totals[signal].sum / totals[signal].count : null, coverage: totals[signal].count / path.length }])) as Record<OrchidFingerScoredSignal, GestureSignalScore>;
  const softScore = weightedAverage(Object.fromEntries(SIGNALS.map((signal) => [signal, signalScores[signal].score])) as PointScores);
  const trackingCoverage = requiredSignalCoverage(trajectory);
  const movementCompleteness = calculateMovementCompleteness(trajectory, reference);
  return { overallScore: softScore * Math.min(1, trackingCoverage / ORCHID_FINGER_FULL_COVERAGE) * movementCompleteness, movementCompleteness, trackingCoverage, trackingStatus: trackingStatus(trackingCoverage), alignedPairs: path.length, signalScores };
}

function calculateMovementCompleteness(trajectory: OrchidFingerTrajectory, reference: OrchidFingerReferenceEnvelope) {
  const ratios = [
    rangeRatio(endpointExcursion(trajectory.samples.map((sample) => sample.leftArm?.elbowFromShoulder)), endpointExcursion(reference.points.map((point) => point.leftElbowPosition?.target))),
    rangeRatio(endpointExcursion(trajectory.samples.map((sample) => sample.rightArm?.elbowFromShoulder)), endpointExcursion(reference.points.map((point) => point.rightElbowPosition?.target))),
    rangeRatio(endpointExcursion(trajectory.samples.map((sample) => sample.leftArm?.wristFromShoulder)), endpointExcursion(reference.points.map((point) => point.leftWristPosition?.target))),
    rangeRatio(endpointExcursion(trajectory.samples.map((sample) => sample.rightArm?.wristFromShoulder)), endpointExcursion(reference.points.map((point) => point.rightWristPosition?.target))),
    rangeRatio(endpointExcursion(trajectory.samples.map((sample) => sample.leftHand?.palmCenterFromBody)), endpointExcursion(reference.points.map((point) => point.leftHand?.palmPosition.target))),
    rangeRatio(endpointExcursion(trajectory.samples.map((sample) => sample.rightHand?.palmCenterFromBody)), endpointExcursion(reference.points.map((point) => point.rightHand?.palmPosition.target))),
  ].filter((ratio): ratio is number => ratio !== null);
  return ratios.length ? ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length : 0;
}
function endpointExcursion(values: readonly ({ x: number; y: number } | null | undefined)[]) {
  const available = values.filter((value): value is { x: number; y: number } => value != null);
  if (available.length < 4) return null;
  const windowSize = Math.max(2, Math.ceil(available.length * 0.15));
  const start = medianPoint(available.slice(0, windowSize));
  const end = medianPoint(available.slice(-windowSize));
  return Math.hypot(end.x - start.x, end.y - start.y);
}
function medianPoint(values: readonly { x: number; y: number }[]) { return { x: median(values.map(({ x }) => x)), y: median(values.map(({ y }) => y)) }; }
function median(values: readonly number[]) { const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2; }
function rangeRatio(actual: number | null, expected: number | null) { return actual === null || expected === null || expected <= 0.01 ? null : Math.min(1, actual / (expected * 0.8)); }

function scorePoint(sample: OrchidFingerTrajectory["samples"][number], reference: OrchidFingerEnvelopePoint): PointScores {
  return {
    leftElbowPosition: vectorMembership(sample.leftArm?.elbowFromShoulder, reference.leftElbowPosition), rightElbowPosition: vectorMembership(sample.rightArm?.elbowFromShoulder, reference.rightElbowPosition),
    leftWristPosition: vectorMembership(sample.leftArm?.wristFromShoulder ?? undefined, reference.leftWristPosition), rightWristPosition: vectorMembership(sample.rightArm?.wristFromShoulder ?? undefined, reference.rightWristPosition),
    leftPalmPosition: vectorMembership(sample.leftHand?.palmCenterFromBody, reference.leftHand?.palmPosition ?? null), rightPalmPosition: vectorMembership(sample.rightHand?.palmCenterFromBody, reference.rightHand?.palmPosition ?? null),
    leftPalmDirection: angularMembership(sample.leftHand?.palmDirectionRad, reference.leftHand?.palmDirection ?? null), rightPalmDirection: angularMembership(sample.rightHand?.palmDirectionRad, reference.rightHand?.palmDirection ?? null),
    leftHandShape: handShapeMembership(sample.leftHand, reference.leftHand), rightHandShape: handShapeMembership(sample.rightHand, reference.rightHand),
  };
}

function handShapeMembership(actual: OrchidFingerTrajectory["samples"][number]["leftHand"], envelope: OrchidFingerHandEnvelope | null): number | null {
  if (!actual || !envelope) return null;
  const values = [
    ...Object.keys(envelope.fingerExtension).map((key) => scalarMembership(actual.fingerExtension[key as keyof typeof actual.fingerExtension], envelope.fingerExtension[key as keyof typeof envelope.fingerExtension])!),
    ...Object.keys(envelope.fingerCurlRad).map((key) => scalarMembership(actual.fingerCurlRad[key as keyof typeof actual.fingerCurlRad], envelope.fingerCurlRad[key as keyof typeof envelope.fingerCurlRad])!),
    ...Object.keys(envelope.thumbToFingertip).map((key) => scalarMembership(actual.thumbToFingertip[key as keyof typeof actual.thumbToFingertip], envelope.thumbToFingertip[key as keyof typeof envelope.thumbToFingertip])!),
  ];
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildAlignmentMatrix(trajectory: OrchidFingerTrajectory, reference: OrchidFingerReferenceEnvelope): AlignmentCell[][] {
  const rows = trajectory.samples.length; const columns = reference.points.length;
  const matrix = Array.from({ length: rows }, () => Array.from({ length: columns }, (): AlignmentCell => ({ cost: Infinity, previous: null })));
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    if (!insideWindow(row, rows, column, columns)) continue;
    const localCost = 1 - weightedAverage(scorePoint(trajectory.samples[row]!, reference.points[column]!));
    if (row === 0 && column === 0) matrix[row]![column] = { cost: localCost, previous: null };
    else { const previous = bestPrevious(matrix, row, column); if (previous) matrix[row]![column] = { cost: previous.cell.cost + localCost, previous: [previous.row, previous.column] }; }
  }
  return matrix;
}
function bestPrevious(matrix: AlignmentCell[][], row: number, column: number) {
  return ([[row - 1, column - 1], [row - 1, column], [row, column - 1]] as const).filter(([r, c]) => r >= 0 && c >= 0).map(([r, c]) => ({ row: r, column: c, cell: matrix[r]![c]! })).filter(({ cell }) => Number.isFinite(cell.cost)).sort((a, b) => a.cell.cost - b.cell.cost)[0] ?? null;
}
function recoverPath(matrix: AlignmentCell[][]) { const path: Array<[number, number]> = []; const last: [number, number] = [matrix.length - 1, (matrix.at(-1)?.length ?? 0) - 1]; if (last[0] < 0 || last[1] < 0 || !Number.isFinite(matrix[last[0]]![last[1]]!.cost)) return path; let cursor: [number, number] | null = last; while (cursor) { path.push(cursor); cursor = matrix[cursor[0]]![cursor[1]]!.previous; } return path.reverse(); }
function vectorMembership(actual: { x: number; y: number } | undefined, envelope: VectorEnvelopeValue | null) { return actual && envelope ? gaussian(Math.hypot(actual.x - envelope.target.x, actual.y - envelope.target.y), envelope.tolerance) : null; }
function scalarMembership(actual: number | undefined, envelope: ScalarEnvelopeValue | null) { return actual !== undefined && envelope ? gaussian(Math.abs(actual - envelope.target), envelope.tolerance) : null; }
function angularMembership(actual: number | undefined, envelope: ScalarEnvelopeValue | null) { return actual !== undefined && envelope ? gaussian(Math.abs(Math.atan2(Math.sin(actual - envelope.target), Math.cos(actual - envelope.target))), envelope.tolerance) : null; }
function gaussian(distance: number, tolerance: number) { if (tolerance <= 0) return distance === 0 ? 1 : 0; return Math.exp(-0.5 * (distance / tolerance) ** 2); }
function weightedAverage(scores: PointScores) { let total = 0; let weight = 0; for (const signal of SIGNALS) if (scores[signal] !== null) { total += scores[signal]! * SIGNAL_WEIGHTS[signal]; weight += SIGNAL_WEIGHTS[signal]; } return weight ? total / weight : 0; }
function requiredSignalCoverage(trajectory: OrchidFingerTrajectory) { if (!trajectory.samples.length) return 0; const available = trajectory.samples.reduce((count, sample) => count + Number(sample.leftArm !== null) + Number(sample.rightArm !== null) + Number(sample.leftArm?.wristFromShoulder != null) + Number(sample.rightArm?.wristFromShoulder != null), 0); return available / (trajectory.samples.length * 4); }
function trackingStatus(coverage: number): GestureTrackingStatus { return coverage >= ORCHID_FINGER_FULL_COVERAGE ? "good" : coverage >= 0.5 ? "limited" : "insufficient"; }
function insideWindow(row: number, rows: number, column: number, columns: number) { return Math.abs((rows > 1 ? row / (rows - 1) : 0) - (columns > 1 ? column / (columns - 1) : 0)) <= ORCHID_FINGER_ALIGNMENT_WINDOW; }
function emptyEvaluation(): OrchidFingerEvaluation { return { overallScore: 0, movementCompleteness: 0, trackingCoverage: 0, trackingStatus: "insufficient", alignedPairs: 0, signalScores: Object.fromEntries(SIGNALS.map((signal) => [signal, { score: null, coverage: 0 }])) as Record<OrchidFingerScoredSignal, GestureSignalScore> }; }
