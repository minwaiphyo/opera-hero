import { describe, expect, it } from "vitest";
import type { GameScore } from "../contract";
import {
  ABANDON_AFTER_MS,
  ABSENT_GRACE_MS,
  CAMERA_GRACE_MS,
  CAMERA_MESSAGE,
  DWELL_MS,
  createFlowState,
  dwellProgress,
  flowReducer,
  type FlowEvent,
  type FlowState,
} from "./gameFlow";

const SCORE: GameScore = {
  overallScore: 0.72,
  movementCompleteness: 0.8,
  trackingCoverage: 0.9,
  trackingStatus: "good",
};

function apply(state: FlowState, ...events: FlowEvent[]): FlowState {
  return events.reduce(flowReducer, state);
}

function wait(state: FlowState, ms: number, present = true): FlowState {
  let current = state;
  for (let elapsed = 0; elapsed < ms; elapsed += 200) {
    current = flowReducer(current, { type: "tick", deltaMs: 200, present });
  }
  return current;
}

function booth(): FlowState {
  return apply(createFlowState(), { type: "camera", ready: true });
}

/** Attract → learn, the way a visitor gets there: by pressing Start. */
function learning(): FlowState {
  const state = apply(booth(), { type: "start" });
  expect(state.screen).toBe("learn");
  expect(state.gestureId).toBe("orchid-finger");
  return state;
}

/** Attract → learn → capture handover for level one. */
function readyToPerform(): FlowState {
  return apply(learning(), { type: "next" });
}

describe("booth flow", () => {
  it("waits on attract until the visitor presses start", () => {
    // Somebody standing there is not somebody who wants a turn: people walk past the
    // booth, queue at it, and watch a friend perform.
    expect(wait(booth(), 30_000).screen).toBe("attract");
    expect(apply(booth(), { type: "start" }).screen).toBe("learn");
  });

  it("does not start a session before the camera is running", () => {
    const noCamera = wait(createFlowState(), 2_000);
    expect(apply(noCamera, { type: "start" }).screen).toBe("attract");
  });

  it("hands the countdown and attempt to the capture policy", () => {
    let state = readyToPerform();
    expect(state.screen).toBe("countdown");
    expect(state.captureIntent).toBe("start");

    state = apply(state, { type: "capture-handled" });
    expect(state.captureIntent).toBeNull();

    state = apply(state, { type: "capture-phase", phase: "countdown", score: null });
    expect(state.screen).toBe("countdown");

    state = apply(state, { type: "capture-phase", phase: "recording", score: null });
    expect(state.screen).toBe("attempt");

    state = apply(state, { type: "capture-phase", phase: "completed", score: SCORE });
    expect(state.screen).toBe("result");
    expect(state.score).toEqual(SCORE);
  });

  it("treats a timed-out attempt as a result too", () => {
    const state = apply(readyToPerform(), {
      type: "capture-phase",
      phase: "timed-out",
      score: SCORE,
    });
    expect(state.screen).toBe("result");
  });

  it("advances every reading screen without anybody pressing a button", () => {
    let state = readyToPerform();

    for (const expected of ["orchid-finger", "opening-door", "water-sleeves"]) {
      expect(state.gestureId).toBe(expected);
      state = apply(state, { type: "capture-phase", phase: "completed", score: SCORE });
      expect(state.screen).toBe("result");

      state = wait(state, DWELL_MS.result + 400);
      if (state.screen === "learn") {
        state = wait(state, DWELL_MS.learn + 400);
        state = apply(state, { type: "capture-handled" });
      }
    }

    expect(state.screen).toBe("complete");
    expect(wait(state, DWELL_MS.complete + 400).screen).toBe("attract");
  });

  it("hands back to recovery when the visitor leaves, and resumes when they return", () => {
    let state = learning();
    state = wait(state, ABSENT_GRACE_MS + 400, false);
    expect(state.screen).toBe("recovery");
    expect(state.resumeScreen).toBe("learn");

    state = wait(state, 400);
    expect(state.screen).toBe("learn");
  });

  it("cancels an in-flight attempt when the visitor leaves the frame", () => {
    const state = wait(readyToPerform(), ABSENT_GRACE_MS + 400, false);
    expect(state.screen).toBe("recovery");
    expect(state.captureIntent).toBe("cancel");
    expect(state.resumeScreen).toBe("learn");
  });

  it("returns an abandoned session to attract", () => {
    let state = learning();
    state = wait(state, ABANDON_AFTER_MS + ABSENT_GRACE_MS + 1_000, false);
    expect(state.screen).toBe("attract");
    expect(state.level).toBeNull();
  });

  it("waits out a slow camera at boot instead of crying for help", () => {
    const warmingUp = wait(createFlowState(), CAMERA_GRACE_MS - 2_000, false);
    expect(warmingUp.screen).toBe("attract");
    expect(apply(warmingUp, { type: "camera", ready: true }).screen).toBe("attract");
  });

  it("asks for staff once the camera has genuinely failed", () => {
    const stalled = wait(createFlowState(), CAMERA_GRACE_MS + 1_000, false);
    expect(stalled.screen).toBe("recovery");
    expect(stalled.message).toBe(CAMERA_MESSAGE);

    const recovered = apply(stalled, { type: "camera", ready: true });
    expect(recovered.screen).toBe("attract");
    expect(recovered.message).toBeNull();
  });

  it("reports a camera loss mid-session and resumes afterwards", () => {
    let state = learning();
    state = apply(state, { type: "camera", ready: false });
    expect(state.screen).toBe("recovery");
    expect(state.message).toBe(CAMERA_MESSAGE);

    state = apply(state, { type: "camera", ready: true });
    expect(state.screen).toBe("learn");
    expect(state.message).toBeNull();
  });

  it("restarts the capture when the visitor retries", () => {
    const result = apply(readyToPerform(), {
      type: "capture-phase",
      phase: "completed",
      score: SCORE,
    });
    const retried = apply(result, { type: "retry" });

    expect(retried.screen).toBe("countdown");
    expect(retried.captureIntent).toBe("start");
    expect(retried.score).toBeNull();
  });

  it("sends a cancelled capture back to the guide, not to a result", () => {
    const state = apply(readyToPerform(), {
      type: "capture-phase",
      phase: "cancelled",
      score: null,
    });
    expect(state.screen).toBe("learn");
  });

  it("quits back to attract from anywhere", () => {
    expect(apply(readyToPerform(), { type: "quit" }).screen).toBe("attract");
  });

  /**
   * There is one scorer per gesture and it holds its last phase, so a gesture can still
   * be reporting a finished attempt when the next visitor arrives at it. Nobody may be
   * shown a score they did not perform.
   */
  it("ignores a capture report that arrives outside an attempt", () => {
    for (const screen of ["learn", "result", "complete"] as const) {
      const state: FlowState = { ...readyToPerform(), screen, score: null };
      const reported = apply(state, {
        type: "capture-phase",
        phase: "completed",
        score: SCORE,
      });

      expect(reported.screen).toBe(screen);
      expect(reported.score).toBeNull();
    }
  });

  it("clears the incoming gesture's scorer as each level begins", () => {
    const scored = apply(readyToPerform(), {
      type: "capture-phase",
      phase: "completed",
      score: SCORE,
    });

    const nextLevel = apply(scored, { type: "next" });

    expect(nextLevel.screen).toBe("learn");
    expect(nextLevel.gestureId).toBe("opening-door");
    expect(nextLevel.captureIntent).toBe("cancel");
    expect(nextLevel.score).toBeNull();
  });

  it("reports dwell progress only for screens that advance themselves", () => {
    const learn = learning();
    expect(dwellProgress(learn)).toBeCloseTo(0, 1);
    expect(dwellProgress(wait(learn, DWELL_MS.learn / 2))).toBeGreaterThan(0.4);

    const attempt = apply(readyToPerform(), {
      type: "capture-phase",
      phase: "recording",
      score: null,
    });
    expect(dwellProgress(attempt)).toBeNull();
  });
});
