import { useCallback, useEffect, useRef, useState } from "react";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import {
  WaterSleevesAutomaticCapture,
  type AutomaticCapturePhase,
} from "../../domain/gestures/live/waterSleevesAutomaticCapture";
import {
  type LiveAttemptSnapshot,
} from "../../domain/gestures/live/waterSleevesAttemptBuffer";
import { WATER_SLEEVES_REFERENCE } from "../../domain/gestures/references/waterSleevesReference";
import {
  evaluateWaterSleevesTrajectory,
  type WaterSleevesEvaluation,
} from "../../domain/gestures/scoring/waterSleevesEvaluator";

export interface WaterSleevesLiveScoringState {
  snapshot: LiveAttemptSnapshot;
  capturePhase: AutomaticCapturePhase;
  countdownRemainingMs: number;
  evaluation: WaterSleevesEvaluation | null;
  hasCompletedTrajectory: boolean;
}

const epochNow = () => performance.timeOrigin + performance.now();
const IDLE_STATE: WaterSleevesLiveScoringState = {
  snapshot: {
    attemptId: null,
    status: "idle",
    tracking: "awaiting",
    bufferedSamples: 0,
    usableSamples: 0,
    elapsedMs: 0,
  },
  capturePhase: "idle",
  countdownRemainingMs: 0,
  evaluation: null,
  hasCompletedTrajectory: false,
};

export function useWaterSleevesLiveScoring(sessionId: string | null) {
  const captureRef = useRef(new WaterSleevesAutomaticCapture());
  const attemptSequence = useRef(0);
  const evaluatedAttemptRef = useRef<string | null>(null);
  const sessionRef = useRef(sessionId);
  const [state, setState] = useState<WaterSleevesLiveScoringState>(IDLE_STATE);

  const publish = useCallback((nowMs = epochNow()) => {
    const capture = captureRef.current;
    const captureSnapshot = capture.advance(nowMs);
    const snapshot = {
      ...captureSnapshot.attempt,
      attemptId: captureSnapshot.attemptId,
      status:
        captureSnapshot.phase === "completed" ||
        captureSnapshot.phase === "timed-out" ||
        captureSnapshot.phase === "cancelled"
          ? captureSnapshot.phase
          : captureSnapshot.attempt.status,
    } satisfies LiveAttemptSnapshot;
    const trajectory = capture.getTrajectory();
    let evaluation: WaterSleevesEvaluation | null = null;
    if (trajectory && evaluatedAttemptRef.current === snapshot.attemptId) {
      evaluation = evaluateWaterSleevesTrajectory(
        trajectory,
        WATER_SLEEVES_REFERENCE,
      );
    } else if (
      trajectory &&
      (captureSnapshot.phase === "completed" || captureSnapshot.phase === "timed-out")
    ) {
      evaluatedAttemptRef.current = snapshot.attemptId;
      evaluation = evaluateWaterSleevesTrajectory(
        trajectory,
        WATER_SLEEVES_REFERENCE,
      );
    }
    setState({
      snapshot,
      capturePhase: captureSnapshot.phase,
      countdownRemainingMs: captureSnapshot.countdownRemainingMs,
      evaluation,
      hasCompletedTrajectory: trajectory !== null,
    });
  }, []);

  const reset = useCallback(() => {
    captureRef.current.reset();
    evaluatedAttemptRef.current = null;
    setState(IDLE_STATE);
  }, []);

  useEffect(() => {
    if (sessionRef.current === sessionId) return;
    sessionRef.current = sessionId;
    const timer = window.setTimeout(reset, 0);
    return () => window.clearTimeout(timer);
  }, [reset, sessionId]);

  useEffect(() => {
    if (state.capturePhase !== "countdown") return;
    const timer = window.setInterval(() => publish(), 100);
    return () => window.clearInterval(timer);
  }, [publish, state.capturePhase]);

  const start = useCallback(() => {
    attemptSequence.current += 1;
    evaluatedAttemptRef.current = null;
    captureRef.current.start(
      `${sessionId ?? "camera"}-${attemptSequence.current}`,
      epochNow(),
    );
    publish();
  }, [publish, sessionId]);

  const finish = useCallback(() => {
    captureRef.current.finish(epochNow());
    publish();
  }, [publish]);

  const cancel = useCallback(() => {
    captureRef.current.cancel();
    evaluatedAttemptRef.current = null;
    publish();
  }, [publish]);

  const onFrame = useCallback(
    (frame: VisionLandmarkFrame) => {
      const phase = captureRef.current.getSnapshot(frame.capturedAtMs).phase;
      if (
        phase !== "countdown" &&
        phase !== "waiting-for-movement" &&
        phase !== "recording"
      ) return;
      captureRef.current.push(frame);
      publish(frame.capturedAtMs);
    },
    [publish],
  );

  return { state, start, finish, cancel, reset, onFrame };
}
