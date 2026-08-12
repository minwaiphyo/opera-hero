/**
 * The session state machine.
 *
 * Pure — no React, no camera, no timers of its own. The runtime hook feeds it ticks,
 * presence and capture-phase changes; it decides what the visitor sees.
 *
 * Two rules shape it:
 *
 * 1. The visitor starts the session deliberately, by pressing Start. Once they have, the
 *    booth carries them: every later screen advances on its own, and an abandoned session
 *    finds its own way back to attract without anybody attending to it. Before that, the
 *    menu also offers a tutorial, which previews the movements without starting a session
 *    and therefore never advances by itself.
 * 2. Attempt timing is NOT decided here. `capturePhase` comes from the approved capture
 *    policy in `src/domain/gestures/live/`; this machine follows it.
 */

import type { GameScore, GameScreen, GestureId, Level } from "../contract";
import { TOTAL_LEVELS, gestureForLevel } from "../content";

export type CapturePhase =
  | "idle"
  | "countdown"
  | "recording"
  | "completed"
  | "timed-out"
  | "cancelled";

/** Reading time per screen before it moves on by itself. */
export const DWELL_MS = {
  learn: 14_000,
  result: 12_000,
  complete: 15_000,
} as const satisfies Partial<Record<GameScreen, number>>;

/** Empty frame for this long mid-session hands back to recovery. */
export const ABSENT_GRACE_MS = 7_000;
/** Continued absence returns the booth to attract. */
export const ABANDON_AFTER_MS = 18_000;
/** How long attract waits for a camera before asking for staff. */
export const CAMERA_GRACE_MS = 8_000;

export type CaptureIntent = "start" | "cancel" | null;

export interface FlowState {
  readonly screen: GameScreen;
  readonly level: Level | null;
  readonly gestureId: GestureId | null;
  readonly score: GameScore | null;
  readonly message: string | null;
  readonly dwellLeftMs: number | null;
  readonly dwellTotalMs: number | null;
  readonly absentMs: number;
  readonly cameraDownMs: number;
  readonly cameraReady: boolean;
  readonly captureIntent: CaptureIntent;
  readonly resumeScreen: GameScreen | null;
}

export type FlowEvent =
  | { type: "tick"; deltaMs: number; present: boolean }
  | { type: "capture-phase"; phase: CapturePhase; score: GameScore | null }
  | { type: "capture-handled" }
  | { type: "camera"; ready: boolean }
  | { type: "calibration-complete" }
  | { type: "tutorial" }
  | { type: "start" }
  | { type: "next" }
  | { type: "retry" }
  | { type: "quit" };

export const CAMERA_MESSAGE =
  "The camera isn't available. Please ask a member of festival staff.";

export function createFlowState(): FlowState {
  return {
    screen: "attract",
    level: null,
    gestureId: null,
    score: null,
    message: null,
    dwellLeftMs: null,
    dwellTotalMs: null,
    absentMs: 0,
    cameraDownMs: 0,
    cameraReady: false,
    captureIntent: null,
    resumeScreen: null,
  };
}

export function flowReducer(state: FlowState, event: FlowEvent): FlowState {
  switch (event.type) {
    case "tick":
      return tick(state, event.deltaMs, event.present);
    case "capture-phase":
      return capturePhase(state, event.phase, event.score);
    case "capture-handled":
      return { ...state, captureIntent: null };
    case "camera":
      return camera(state, event.ready);
    case "calibration-complete":
      return state.screen === "calibration" ? enterLevel(state, 1) : state;
    case "tutorial":
      // The tutorial previews the movements before the visitor commits. It is gated the
      // same way as Start, so nobody is led into a booth that cannot see them.
      return state.screen === "attract" && state.cameraReady
        ? enter(state, "tutorial")
        : state;
    case "start":
      // Never begin a turn the booth cannot see. Attract shows the camera's state, and
      // `tick` asks for staff if it stays down.
      return state.screen === "attract" && state.cameraReady
        ? enter(state, "calibration")
        : state;
    case "next":
      return next(state);
    case "retry":
      return state.gestureId
        ? { ...enter(state, "countdown"), score: null, captureIntent: "start" }
        : state;
    case "quit":
      return { ...createFlowState(), cameraReady: state.cameraReady };
    default:
      return state;
  }
}

function tick(state: FlowState, deltaMs: number, present: boolean): FlowState {
  const absentMs = present ? 0 : state.absentMs + deltaMs;
  const cameraDownMs = state.cameraReady ? 0 : state.cameraDownMs + deltaMs;
  let now: FlowState = { ...state, absentMs, cameraDownMs };

  // Attract waits for the visitor to press Start. Standing in front of the booth is not
  // the same as wanting a turn: people walk past, queue, and watch somebody else.
  if (state.screen === "attract") {
    // Only ask for help once the camera has had a fair chance to open.
    if (!state.cameraReady && cameraDownMs >= CAMERA_GRACE_MS) {
      return { ...enter(now, "recovery"), message: CAMERA_MESSAGE, resumeScreen: null };
    }
    return now;
  }

  if (state.screen === "recovery") {
    if (!state.cameraReady) {
      return now;
    }
    // Stepping back into frame resumes a session, but never begins one: this visitor
    // already pressed Start, and losing their turn to a stumble would be unkind.
    if (present) {
      return state.resumeScreen
        ? { ...enter(now, state.resumeScreen), resumeScreen: null, message: null }
        : { ...createFlowState(), cameraReady: true };
    }
    if (absentMs >= ABANDON_AFTER_MS) {
      return { ...createFlowState(), cameraReady: state.cameraReady };
    }
    return now;
  }

  // Nobody in frame mid-session is a staging problem, not a failed performance.
  if (absentMs >= ABSENT_GRACE_MS && state.screen !== "complete") {
    return {
      ...enter(now, "recovery"),
      resumeScreen: capturing(state.screen) ? "learn" : state.screen,
      captureIntent: capturing(state.screen) ? "cancel" : null,
    };
  }

  if (now.dwellLeftMs !== null) {
    const left = now.dwellLeftMs - deltaMs;
    if (left <= 0) {
      return next({ ...now, dwellLeftMs: 0 });
    }
    now = { ...now, dwellLeftMs: left };
  }

  return now;
}

function capturePhase(
  state: FlowState,
  phase: CapturePhase,
  score: GameScore | null,
): FlowState {
  // Only follow the capture policy for an attempt this machine actually asked for.
  //
  // There is one scorer per gesture and it keeps its last phase, so the gesture a new
  // visitor starts on can still be reporting `completed` from the previous visitor's
  // attempt. Honouring that would throw them from the guide straight to somebody else's
  // score. A report that arrives outside an attempt describes the past, not the visitor.
  if (!capturing(state.screen)) {
    return state;
  }
  switch (phase) {
    case "countdown":
      return state.screen === "countdown" ? state : enter(state, "countdown");
    case "recording":
      return state.screen === "attempt" ? state : enter(state, "attempt");
    case "completed":
    case "timed-out":
      return state.screen === "result" ? state : { ...enter(state, "result"), score };
    case "cancelled":
      return capturing(state.screen) ? enter(state, "learn") : state;
    default:
      return state;
  }
}

function camera(state: FlowState, ready: boolean): FlowState {
  if (ready) {
    const wasCameraFault =
      state.screen === "recovery" && state.message === CAMERA_MESSAGE;
    if (!wasCameraFault) {
      return { ...state, cameraReady: true, cameraDownMs: 0 };
    }
    return state.resumeScreen
      ? {
          ...enter({ ...state, cameraReady: true, message: null }, state.resumeScreen),
          resumeScreen: null,
        }
      : { ...createFlowState(), cameraReady: true };
  }

  // On attract the camera is simply still warming up; `tick` decides when that has
  // taken long enough to be worth telling anyone about.
  if (state.screen === "attract" || state.screen === "recovery") {
    return { ...state, cameraReady: false };
  }
  return {
    ...enter(state, "recovery"),
    cameraReady: false,
    message: CAMERA_MESSAGE,
    resumeScreen: capturing(state.screen) ? "learn" : state.screen,
    captureIntent: capturing(state.screen) ? "cancel" : null,
  };
}

function next(state: FlowState): FlowState {
  switch (state.screen) {
    case "attract":
      return enterLevel(state, 1);
    case "tutorial":
      // The preview is over; position the visitor before beginning level one.
      return enter(state, "calibration");
    case "calibration":
      return state;
    case "learn":
      // Hand over to the capture policy: it owns the countdown and the attempt.
      return { ...enter(state, "countdown"), captureIntent: "start" };
    case "countdown":
    case "attempt":
      return state;
    case "result":
      return state.level !== null && state.level < TOTAL_LEVELS
        ? enterLevel(state, (state.level + 1) as Level)
        : { ...enter(state, "complete"), score: null };
    case "complete":
      return { ...createFlowState(), cameraReady: state.cameraReady };
    case "recovery":
      return state.resumeScreen
        ? { ...enter(state, state.resumeScreen), resumeScreen: null, message: null }
        : { ...createFlowState(), cameraReady: state.cameraReady };
    default:
      return state;
  }
}

function enterLevel(state: FlowState, level: Level): FlowState {
  return {
    ...enter(state, "learn"),
    level,
    gestureId: gestureForLevel(level).id,
    score: null,
    // Clear the incoming gesture's scorer before the visitor reaches it: it may still be
    // holding the attempt and evaluation from whoever performed this level last.
    captureIntent: "cancel",
  };
}

function enter(state: FlowState, screen: GameScreen): FlowState {
  const dwell = screen in DWELL_MS ? DWELL_MS[screen as keyof typeof DWELL_MS] : null;
  return {
    ...state,
    screen,
    dwellLeftMs: dwell,
    dwellTotalMs: dwell,
    message: screen === "recovery" ? state.message : null,
    absentMs: 0,
  };
}

function capturing(screen: GameScreen): boolean {
  return screen === "countdown" || screen === "attempt";
}

/** 0..1 through the current screen's dwell, for the on-screen progress line. */
export function dwellProgress(state: FlowState): number | null {
  if (state.dwellLeftMs === null || !state.dwellTotalMs) {
    return null;
  }
  return Math.min(1, Math.max(0, 1 - state.dwellLeftMs / state.dwellTotalMs));
}
