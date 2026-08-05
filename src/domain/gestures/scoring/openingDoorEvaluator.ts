import type { OpeningDoorTrajectory } from "../features/openingDoorTrajectory";
import type {
  GestureEvaluation,
  GestureSignalScore,
  GestureTrackingStatus,
} from "./gestureScoringContract";
import type {
  OpeningDoorEnvelopePoint,
  OpeningDoorReferenceEnvelope,
} from "./openingDoorEnvelope";
import type { ScalarEnvelopeValue, VectorEnvelopeValue } from "./waterSleevesEnvelope";

export const OPENING_DOOR_ALIGNMENT_WINDOW = 0.25;
export const OPENING_DOOR_FULL_COVERAGE = 0.8;

export type OpeningDoorScoredSignal =
  | "leftElbowPosition"
  | "rightElbowPosition"
  | "leftWristPosition"
  | "rightWristPosition"
  | "leftPalmPosition"
  | "rightPalmPosition"
  | "leftPalmDirection"
  | "rightPalmDirection"
  | "leftHandOpenness"
  | "rightHandOpenness";

export interface OpeningDoorEvaluation
  extends GestureEvaluation<OpeningDoorScoredSignal> {
  movementCompleteness: number;
}

type PointScores = Record<OpeningDoorScoredSignal, number | null>;
interface AlignmentCell {
  cost: number;
  previous: [number, number] | null;
}

const SIGNAL_WEIGHTS: Record<OpeningDoorScoredSignal, number> = {
  leftElbowPosition: 1,
  rightElbowPosition: 1,
  leftWristPosition: 1,
  rightWristPosition: 1,
  leftPalmPosition: 0.35,
  rightPalmPosition: 0.35,
  leftPalmDirection: 0.2,
  rightPalmDirection: 0.2,
  leftHandOpenness: 0.2,
  rightHandOpenness: 0.2,
};
const SIGNALS = Object.keys(SIGNAL_WEIGHTS) as OpeningDoorScoredSignal[];

export function evaluateOpeningDoorTrajectory(
  trajectory: OpeningDoorTrajectory,
  reference: OpeningDoorReferenceEnvelope,
): OpeningDoorEvaluation {
  if (trajectory.samples.length === 0 || reference.points.length === 0) {
    return emptyEvaluation();
  }
  const path = recoverPath(buildAlignmentMatrix(trajectory, reference));
  if (path.length === 0) return emptyEvaluation();
  const totals = Object.fromEntries(
    SIGNALS.map((signal) => [signal, { sum: 0, count: 0 }]),
  ) as Record<OpeningDoorScoredSignal, { sum: number; count: number }>;
  for (const [sampleIndex, referenceIndex] of path) {
    const scores = scorePoint(
      trajectory.samples[sampleIndex]!,
      reference.points[referenceIndex]!,
    );
    for (const signal of SIGNALS) {
      const score = scores[signal];
      if (score !== null) {
        totals[signal].sum += score;
        totals[signal].count += 1;
      }
    }
  }
  const signalScores = Object.fromEntries(
    SIGNALS.map((signal) => [signal, {
      score: totals[signal].count > 0
        ? totals[signal].sum / totals[signal].count
        : null,
      coverage: totals[signal].count / path.length,
    }]),
  ) as Record<OpeningDoorScoredSignal, GestureSignalScore>;
  const softScore = weightedAverage(
    Object.fromEntries(
      SIGNALS.map((signal) => [signal, signalScores[signal].score]),
    ) as PointScores,
  );
  const trackingCoverage = requiredSignalCoverage(trajectory);
  const coverageFactor = Math.min(1, trackingCoverage / OPENING_DOOR_FULL_COVERAGE);
  const movementCompleteness = calculateMovementCompleteness(trajectory, reference);
  return {
    overallScore: softScore * coverageFactor * movementCompleteness,
    movementCompleteness,
    trackingCoverage,
    trackingStatus: trackingStatus(trackingCoverage),
    alignedPairs: path.length,
    signalScores,
  };
}

function calculateMovementCompleteness(
  trajectory: OpeningDoorTrajectory,
  reference: OpeningDoorReferenceEnvelope,
): number {
  const ratios = [
    excursionRatio(
      vectorRange(trajectory.samples.map((sample) => sample.leftArm?.elbowFromShoulder)),
      vectorRange(reference.points.map((point) => point.leftElbowPosition?.target)),
    ),
    excursionRatio(
      vectorRange(trajectory.samples.map((sample) => sample.rightArm?.elbowFromShoulder)),
      vectorRange(reference.points.map((point) => point.rightElbowPosition?.target)),
    ),
    excursionRatio(
      vectorRange(trajectory.samples.map((sample) => sample.leftArm?.wristFromShoulder)),
      vectorRange(reference.points.map((point) => point.leftWristPosition?.target)),
    ),
    excursionRatio(
      vectorRange(trajectory.samples.map((sample) => sample.rightArm?.wristFromShoulder)),
      vectorRange(reference.points.map((point) => point.rightWristPosition?.target)),
    ),
  ].filter((ratio): ratio is number => ratio !== null);
  return ratios.length
    ? ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length
    : 0;
}

function vectorRange(
  values: readonly ({ x: number; y: number } | null | undefined)[],
): number | null {
  const available = values.filter(
    (value): value is { x: number; y: number } => value != null,
  );
  if (available.length < 2) return null;
  return Math.hypot(
    Math.max(...available.map(({ x }) => x)) - Math.min(...available.map(({ x }) => x)),
    Math.max(...available.map(({ y }) => y)) - Math.min(...available.map(({ y }) => y)),
  );
}

function excursionRatio(actual: number | null, expected: number | null): number | null {
  if (actual === null || expected === null || expected <= 0.01) return null;
  return Math.min(1, actual / (expected * 0.8));
}

function buildAlignmentMatrix(
  trajectory: OpeningDoorTrajectory,
  reference: OpeningDoorReferenceEnvelope,
): AlignmentCell[][] {
  const rows = trajectory.samples.length;
  const columns = reference.points.length;
  const matrix = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, (): AlignmentCell => ({
      cost: Number.POSITIVE_INFINITY,
      previous: null,
    })),
  );
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (!insideAlignmentWindow(row, rows, column, columns)) continue;
      const localCost = 1 - weightedAverage(
        scorePoint(trajectory.samples[row]!, reference.points[column]!),
      );
      if (row === 0 && column === 0) {
        matrix[row]![column] = { cost: localCost, previous: null };
        continue;
      }
      const previous = bestPrevious(matrix, row, column);
      if (previous) {
        matrix[row]![column] = {
          cost: previous.cell.cost + localCost,
          previous: [previous.row, previous.column],
        };
      }
    }
  }
  return matrix;
}

function bestPrevious(matrix: AlignmentCell[][], row: number, column: number) {
  const candidates = [[row - 1, column - 1], [row - 1, column], [row, column - 1]] as const;
  return candidates
    .filter(([candidateRow, candidateColumn]) => candidateRow >= 0 && candidateColumn >= 0)
    .map(([candidateRow, candidateColumn]) => ({
      row: candidateRow,
      column: candidateColumn,
      cell: matrix[candidateRow]![candidateColumn]!,
    }))
    .filter((candidate) => Number.isFinite(candidate.cell.cost))
    .sort((a, b) => a.cell.cost - b.cell.cost)[0] ?? null;
}

function recoverPath(matrix: AlignmentCell[][]): Array<[number, number]> {
  const lastRow = matrix.length - 1;
  const lastColumn = (matrix[lastRow]?.length ?? 0) - 1;
  if (lastRow < 0 || lastColumn < 0) return [];
  if (!Number.isFinite(matrix[lastRow]![lastColumn]!.cost)) return [];
  const path: Array<[number, number]> = [];
  let cursor: [number, number] | null = [lastRow, lastColumn];
  while (cursor) {
    path.push(cursor);
    cursor = matrix[cursor[0]]![cursor[1]]!.previous;
  }
  return path.reverse();
}

function scorePoint(
  sample: OpeningDoorTrajectory["samples"][number],
  reference: OpeningDoorEnvelopePoint,
): PointScores {
  return {
    leftElbowPosition: vectorMembership(sample.leftArm?.elbowFromShoulder, reference.leftElbowPosition),
    rightElbowPosition: vectorMembership(sample.rightArm?.elbowFromShoulder, reference.rightElbowPosition),
    leftWristPosition: vectorMembership(sample.leftArm?.wristFromShoulder ?? undefined, reference.leftWristPosition),
    rightWristPosition: vectorMembership(sample.rightArm?.wristFromShoulder ?? undefined, reference.rightWristPosition),
    leftPalmPosition: vectorMembership(sample.leftHand?.palmCenterFromBody, reference.leftPalmPosition),
    rightPalmPosition: vectorMembership(sample.rightHand?.palmCenterFromBody, reference.rightPalmPosition),
    leftPalmDirection: angularMembership(sample.leftHand?.palmDirectionRad, reference.leftPalmDirection),
    rightPalmDirection: angularMembership(sample.rightHand?.palmDirectionRad, reference.rightPalmDirection),
    leftHandOpenness: scalarMembership(sample.leftHand?.openness, reference.leftHandOpenness),
    rightHandOpenness: scalarMembership(sample.rightHand?.openness, reference.rightHandOpenness),
  };
}

function vectorMembership(
  actual: { x: number; y: number } | undefined,
  envelope: VectorEnvelopeValue | null,
): number | null {
  if (!actual || !envelope) return null;
  return gaussian(Math.hypot(actual.x - envelope.target.x, actual.y - envelope.target.y), envelope.tolerance);
}

function angularMembership(actual: number | undefined, envelope: ScalarEnvelopeValue | null) {
  if (actual === undefined || !envelope) return null;
  const distance = Math.abs(Math.atan2(
    Math.sin(actual - envelope.target),
    Math.cos(actual - envelope.target),
  ));
  return gaussian(distance, envelope.tolerance);
}

function scalarMembership(actual: number | undefined, envelope: ScalarEnvelopeValue | null) {
  if (actual === undefined || !envelope) return null;
  return gaussian(Math.abs(actual - envelope.target), envelope.tolerance);
}

function gaussian(distance: number, tolerance: number): number {
  if (tolerance <= 0) return distance === 0 ? 1 : 0;
  const normalized = distance / tolerance;
  return Math.exp(-0.5 * normalized * normalized);
}

function weightedAverage(scores: PointScores): number {
  let weightedTotal = 0;
  let availableWeight = 0;
  for (const signal of SIGNALS) {
    const score = scores[signal];
    if (score === null) continue;
    weightedTotal += score * SIGNAL_WEIGHTS[signal];
    availableWeight += SIGNAL_WEIGHTS[signal];
  }
  return availableWeight > 0 ? weightedTotal / availableWeight : 0;
}

function requiredSignalCoverage(trajectory: OpeningDoorTrajectory): number {
  if (trajectory.samples.length === 0) return 0;
  const available = trajectory.samples.reduce((count, sample) => count +
    Number(sample.leftArm !== null) +
    Number(sample.rightArm !== null) +
    Number(sample.leftArm?.wristFromShoulder != null) +
    Number(sample.rightArm?.wristFromShoulder != null), 0);
  return available / (trajectory.samples.length * 4);
}

function trackingStatus(coverage: number): GestureTrackingStatus {
  if (coverage >= OPENING_DOOR_FULL_COVERAGE) return "good";
  if (coverage >= 0.5) return "limited";
  return "insufficient";
}

function insideAlignmentWindow(row: number, rows: number, column: number, columns: number) {
  const rowProgress = rows > 1 ? row / (rows - 1) : 0;
  const columnProgress = columns > 1 ? column / (columns - 1) : 0;
  return Math.abs(rowProgress - columnProgress) <= OPENING_DOOR_ALIGNMENT_WINDOW;
}

function emptyEvaluation(): OpeningDoorEvaluation {
  return {
    overallScore: 0,
    movementCompleteness: 0,
    trackingCoverage: 0,
    trackingStatus: "insufficient",
    alignedPairs: 0,
    signalScores: Object.fromEntries(
      SIGNALS.map((signal) => [signal, { score: null, coverage: 0 }]),
    ) as Record<OpeningDoorScoredSignal, GestureSignalScore>,
  };
}
