export const GESTURE_IDS = [
  "orchid-finger",
  "opening-door",
  "water-sleeves",
] as const;

export type GestureId = (typeof GESTURE_IDS)[number];

export type GestureTrackingStatus = "good" | "limited" | "insufficient";

export interface GestureSignalScore {
  score: number | null;
  coverage: number;
}

export interface GestureEvaluation<Signal extends string> {
  overallScore: number;
  trackingCoverage: number;
  trackingStatus: GestureTrackingStatus;
  alignedPairs: number;
  signalScores: Record<Signal, GestureSignalScore>;
}

export interface GestureScorer<Attempt, Signal extends string> {
  readonly gestureId: GestureId;
  evaluate(attempt: Attempt): GestureEvaluation<Signal>;
}

export interface GestureDefinition {
  id: GestureId;
  level: 1 | 2 | 3;
  displayName: string;
}

export const GESTURE_DEFINITIONS: readonly GestureDefinition[] = [
  { id: "orchid-finger", level: 1, displayName: "Orchid Finger" },
  { id: "opening-door", level: 2, displayName: "Opening Door" },
  { id: "water-sleeves", level: 3, displayName: "Water Sleeves" },
];

export function getGestureDefinition(id: GestureId): GestureDefinition {
  return GESTURE_DEFINITIONS.find((definition) => definition.id === id)!;
}
