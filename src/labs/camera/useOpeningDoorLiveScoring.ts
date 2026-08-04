import { useCallback, useEffect, useRef, useState } from "react";
import { extractLiveOpeningDoorTrajectory } from "../../domain/gestures/features/openingDoorTrajectory";
import {
  WaterSleevesAutomaticCapture,
  type AutomaticCapturePhase,
} from "../../domain/gestures/live/waterSleevesAutomaticCapture";
import type { LiveAttemptSnapshot } from "../../domain/gestures/live/waterSleevesAttemptBuffer";
import { OPENING_DOOR_REFERENCE } from "../../domain/gestures/references/openingDoorReference";
import {
  evaluateOpeningDoorTrajectory,
  type OpeningDoorEvaluation,
} from "../../domain/gestures/scoring/openingDoorEvaluator";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";

export interface OpeningDoorLiveScoringState {
  snapshot: LiveAttemptSnapshot;
  capturePhase: AutomaticCapturePhase;
  countdownRemainingMs: number;
  evaluation: OpeningDoorEvaluation | null;
  hasCompletedTrajectory: boolean;
}

const epochNow = () => performance.timeOrigin + performance.now();
const idleState = (): OpeningDoorLiveScoringState => ({
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
});

export function useOpeningDoorLiveScoring(sessionId: string | null) {
  const captureRef = useRef(new WaterSleevesAutomaticCapture());
  const framesRef = useRef<VisionLandmarkFrame[]>([]);
  const attemptSequence = useRef(0);
  const sessionRef = useRef(sessionId);
  const [state, setState] = useState<OpeningDoorLiveScoringState>(idleState);

  const publish = useCallback((nowMs = epochNow()) => {
    const captureSnapshot = captureRef.current.advance(nowMs);
    const terminal = captureSnapshot.phase === "completed" ||
      captureSnapshot.phase === "timed-out";
    const attemptId = captureSnapshot.attemptId;
    const evaluation = terminal && attemptId && framesRef.current.length > 0
      ? evaluateOpeningDoorTrajectory(
          extractLiveOpeningDoorTrajectory(attemptId, framesRef.current),
          OPENING_DOOR_REFERENCE,
        )
      : null;
    const status: LiveAttemptSnapshot["status"] = terminal
      ? captureSnapshot.phase as "completed" | "timed-out"
      : captureSnapshot.phase === "cancelled"
        ? "cancelled"
        : captureSnapshot.attempt.status;
    setState((current) => ({
      snapshot: {
        ...captureSnapshot.attempt,
        attemptId,
        status,
      },
      capturePhase: captureSnapshot.phase,
      countdownRemainingMs: captureSnapshot.countdownRemainingMs,
      evaluation: evaluation ?? (terminal ? current.evaluation : null),
      hasCompletedTrajectory: terminal && framesRef.current.length > 0,
    }));
  }, []);

  const reset = useCallback(() => {
    captureRef.current.reset();
    framesRef.current = [];
    setState(idleState());
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
    framesRef.current = [];
    captureRef.current.start(
      `${sessionId ?? "camera"}-opening-door-${attemptSequence.current}`,
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
    framesRef.current = [];
    publish();
  }, [publish]);
  const onFrame = useCallback((frame: VisionLandmarkFrame) => {
    const before = captureRef.current.getSnapshot(frame.capturedAtMs).phase;
    if (before !== "countdown" && before !== "recording") return;
    const after = captureRef.current.push(frame);
    if (before === "recording" || after.phase === "recording") {
      framesRef.current.push(frame);
    }
    publish(frame.capturedAtMs);
  }, [publish]);

  return { state, start, finish, cancel, reset, onFrame };
}
