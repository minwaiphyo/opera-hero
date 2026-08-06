/**
 * The boundary between the game runtime and the screens.
 *
 * The runtime (`runtime/`) owns the camera, the vision worker, the capture policy and the
 * gesture evaluators. The screens (`ui/`) render this view model and emit these actions,
 * and import none of those things.
 *
 * Screen names are a simplified set of the eleven proposed in
 * `docs/project-tracking/FRONTEND_GAME_HANDOFF.md`, folded down so a visitor at a festival
 * booth meets fewer, clearer states:
 *
 *   handoff                              here
 *   attract, welcome                  →  attract
 *   instructions, demonstration       →  learn
 *   countdown                         →  countdown
 *   attempt                           →  attempt
 *   feedback, cultural-insight        →  result
 *   level-transition, completion      →  complete
 *   recovery                          →  recovery
 *
 * The score fields are unchanged from the handoff: they map one-to-one onto what the
 * gesture evaluators already return.
 */

export const GAME_SCREENS = [
  "attract",
  "learn",
  "countdown",
  "attempt",
  "result",
  "complete",
  "recovery",
] as const;

export type GameScreen = (typeof GAME_SCREENS)[number];

export const TRACKING_PROMPTS = [
  "ready",
  "move-closer",
  "move-farther",
  "step-into-frame",
  "tracking-limited",
] as const;

export type TrackingPrompt = (typeof TRACKING_PROMPTS)[number];

/**
 * Mirrors `GESTURE_IDS` in `src/domain/gestures/scoring/gestureScoringContract.ts`.
 * Duplicated so no screen imports the scoring domain; `contract.test.ts` fails if the two
 * ever drift apart.
 */
export const GESTURE_IDS = [
  "orchid-finger",
  "opening-door",
  "water-sleeves",
] as const;

export type GestureId = (typeof GESTURE_IDS)[number];

export type Level = 1 | 2 | 3;

export type TrackingStatus = "good" | "limited" | "insufficient";

export interface GameScore {
  /** 0..1. Formatted as a percentage in presentation code only. */
  overallScore: number;
  /** 0..1. Whether the movement was actually performed. */
  movementCompleteness: number;
  /** 0..1. How much usable tracking there was. */
  trackingCoverage: number;
  trackingStatus: TrackingStatus;
}

export interface GameView {
  screen: GameScreen;
  level: Level | null;
  gestureId: GestureId | null;
  /** Counts down to the start of an attempt; null at all other times. */
  countdownSeconds: number | null;
  trackingPrompt: TrackingPrompt;
  /** Present on `result` only. Null means the attempt could not be scored. */
  score: GameScore | null;
  /** Changes per attempt, so the practitioner guide restarts from the top. */
  attemptKey: string | null;
  /** Recovery guidance. Never a raw error. */
  message: string | null;
  /** 0..1 until this screen advances itself, or null when it waits. */
  autoAdvance: number | null;
}

export interface GameActions {
  /** Attract → learn. Presence does this on its own; the button is the manual path. */
  start(): void;
  /** Move on: learn → attempt, result → next level, complete → attract. */
  next(): void;
  /** Perform the current gesture again. */
  retry(): void;
  /** Abandon the session and return to attract. */
  quit(): void;
}

export const INITIAL_VIEW: GameView = {
  screen: "attract",
  level: null,
  gestureId: null,
  countdownSeconds: null,
  trackingPrompt: "step-into-frame",
  score: null,
  attemptKey: null,
  message: null,
  autoAdvance: null,
};
