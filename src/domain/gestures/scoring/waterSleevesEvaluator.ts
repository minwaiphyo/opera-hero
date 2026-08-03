import type { WaterSleevesTrajectory } from "../features/waterSleevesTrajectory";
import type {
  ScalarEnvelopeValue,
  VectorEnvelopeValue,
  WaterSleevesEnvelopePoint,
  WaterSleevesReferenceEnvelope,
} from "./waterSleevesEnvelope";

export const WATER_SLEEVES_ALIGNMENT_WINDOW = 0.25;
export const WATER_SLEEVES_FULL_COVERAGE = 0.8;

export type WaterSleevesRequiredSignal =
  | "leftUpperArmAngle"
  | "rightUpperArmAngle"
  | "leftElbowPosition"
  | "rightElbowPosition";

export type EvaluatorTrackingStatus = "good" | "limited" | "insufficient";

export interface WaterSleevesSignalScore {
  score: number | null;
  coverage: number;
}

export interface WaterSleevesEvaluation {
  overallScore: number;
  trackingCoverage: number;
  trackingStatus: EvaluatorTrackingStatus;
  alignedPairs: number;
  signalScores: Record<WaterSleevesRequiredSignal, WaterSleevesSignalScore>;
}

interface PointScores {
  leftUpperArmAngle: number | null;
  rightUpperArmAngle: number | null;
  leftElbowPosition: number | null;
  rightElbowPosition: number | null;
}

interface AlignmentCell {
  cost: number;
  previous: [number, number] | null;
}

const SIGNALS: readonly WaterSleevesRequiredSignal[] = [
  "leftUpperArmAngle",
  "rightUpperArmAngle",
  "leftElbowPosition",
  "rightElbowPosition",
];

export function evaluateWaterSleevesTrajectory(
  trajectory: WaterSleevesTrajectory,
  reference: WaterSleevesReferenceEnvelope,
): WaterSleevesEvaluation {
  if (trajectory.samples.length === 0 || reference.points.length === 0) {
    return emptyEvaluation();
  }

  const matrix = buildAlignmentMatrix(trajectory, reference);
  const path = recoverPath(matrix);
  if (path.length === 0) {
    return emptyEvaluation();
  }

  const totals = Object.fromEntries(
    SIGNALS.map((signal) => [signal, { sum: 0, count: 0 }]),
  ) as Record<WaterSleevesRequiredSignal, { sum: number; count: number }>;
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
    SIGNALS.map((signal) => [
      signal,
      {
        score:
          totals[signal].count > 0
            ? totals[signal].sum / totals[signal].count
            : null,
        coverage: totals[signal].count / path.length,
      },
    ]),
  ) as Record<WaterSleevesRequiredSignal, WaterSleevesSignalScore>;
  const availableScores = SIGNALS.map((signal) => signalScores[signal].score).filter(
    (score): score is number => score !== null,
  );
  const softScore =
    availableScores.length > 0
      ? availableScores.reduce((sum, score) => sum + score, 0) /
        availableScores.length
      : 0;
  const trackingCoverage = requiredSignalCoverage(trajectory);
  const coverageFactor = Math.min(
    1,
    trackingCoverage / WATER_SLEEVES_FULL_COVERAGE,
  );

  return {
    overallScore: softScore * coverageFactor,
    trackingCoverage,
    trackingStatus: trackingStatus(trackingCoverage),
    alignedPairs: path.length,
    signalScores,
  };
}

function buildAlignmentMatrix(
  trajectory: WaterSleevesTrajectory,
  reference: WaterSleevesReferenceEnvelope,
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
      const localCost = 1 - averageAvailable(
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

function bestPrevious(
  matrix: AlignmentCell[][],
  row: number,
  column: number,
): { row: number; column: number; cell: AlignmentCell } | null {
  const candidates = [
    [row - 1, column - 1],
    [row - 1, column],
    [row, column - 1],
  ] as const;
  return (
    candidates
      .filter(([candidateRow, candidateColumn]) =>
        candidateRow >= 0 && candidateColumn >= 0,
      )
      .map(([candidateRow, candidateColumn]) => ({
        row: candidateRow,
        column: candidateColumn,
        cell: matrix[candidateRow]![candidateColumn]!,
      }))
      .filter((candidate) => Number.isFinite(candidate.cell.cost))
      .sort((a, b) => a.cell.cost - b.cell.cost)[0] ?? null
  );
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
  sample: WaterSleevesTrajectory["samples"][number],
  reference: WaterSleevesEnvelopePoint,
): PointScores {
  return {
    leftUpperArmAngle: scalarMembership(
      sample.leftArm?.upperArmAngleRad,
      reference.leftUpperArmAngle,
    ),
    rightUpperArmAngle: scalarMembership(
      sample.rightArm?.upperArmAngleRad,
      reference.rightUpperArmAngle,
    ),
    leftElbowPosition: vectorMembership(
      sample.leftArm?.elbowFromShoulder,
      reference.leftElbowPosition,
    ),
    rightElbowPosition: vectorMembership(
      sample.rightArm?.elbowFromShoulder,
      reference.rightElbowPosition,
    ),
  };
}

function scalarMembership(
  actual: number | undefined,
  envelope: ScalarEnvelopeValue | null,
): number | null {
  if (actual === undefined || envelope === null) return null;
  const distance = Math.abs(
    Math.atan2(
      Math.sin(actual - envelope.target),
      Math.cos(actual - envelope.target),
    ),
  );
  return gaussianMembership(distance, envelope.tolerance);
}

function vectorMembership(
  actual: { x: number; y: number } | undefined,
  envelope: VectorEnvelopeValue | null,
): number | null {
  if (actual === undefined || envelope === null) return null;
  return gaussianMembership(
    Math.hypot(actual.x - envelope.target.x, actual.y - envelope.target.y),
    envelope.tolerance,
  );
}

function gaussianMembership(distance: number, tolerance: number): number {
  if (tolerance <= 0) return distance === 0 ? 1 : 0;
  const normalized = distance / tolerance;
  return Math.exp(-0.5 * normalized * normalized);
}

function averageAvailable(scores: PointScores): number {
  const available = SIGNALS.map((signal) => scores[signal]).filter(
    (score): score is number => score !== null,
  );
  return available.length > 0
    ? available.reduce((sum, score) => sum + score, 0) / available.length
    : 0;
}

function requiredSignalCoverage(trajectory: WaterSleevesTrajectory): number {
  if (trajectory.samples.length === 0) return 0;
  const available = trajectory.samples.reduce((count, sample) => {
    return count + Number(sample.leftArm !== null) * 2 + Number(sample.rightArm !== null) * 2;
  }, 0);
  return available / (trajectory.samples.length * SIGNALS.length);
}

function trackingStatus(coverage: number): EvaluatorTrackingStatus {
  if (coverage >= WATER_SLEEVES_FULL_COVERAGE) return "good";
  if (coverage >= 0.5) return "limited";
  return "insufficient";
}

function insideAlignmentWindow(
  row: number,
  rows: number,
  column: number,
  columns: number,
): boolean {
  const rowProgress = rows > 1 ? row / (rows - 1) : 0;
  const columnProgress = columns > 1 ? column / (columns - 1) : 0;
  return Math.abs(rowProgress - columnProgress) <= WATER_SLEEVES_ALIGNMENT_WINDOW;
}

function emptyEvaluation(): WaterSleevesEvaluation {
  return {
    overallScore: 0,
    trackingCoverage: 0,
    trackingStatus: "insufficient",
    alignedPairs: 0,
    signalScores: Object.fromEntries(
      SIGNALS.map((signal) => [signal, { score: null, coverage: 0 }]),
    ) as Record<WaterSleevesRequiredSignal, WaterSleevesSignalScore>,
  };
}
