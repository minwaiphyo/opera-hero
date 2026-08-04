import { useCallback, useEffect, useRef, useState } from "react";
import { extractLiveOrchidFingerTrajectory } from "../../domain/gestures/features/orchidFingerTrajectory";
import { WaterSleevesAutomaticCapture, type AutomaticCapturePhase } from "../../domain/gestures/live/waterSleevesAutomaticCapture";
import { estimateOrchidFingerMotion } from "../../domain/gestures/live/orchidFingerMotion";
import type { LiveAttemptSnapshot } from "../../domain/gestures/live/waterSleevesAttemptBuffer";
import { ORCHID_FINGER_REFERENCE } from "../../domain/gestures/references/orchidFingerReference";
import { evaluateOrchidFingerTrajectory, type OrchidFingerEvaluation } from "../../domain/gestures/scoring/orchidFingerEvaluator";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";

export interface OrchidFingerLiveScoringState {
  snapshot: LiveAttemptSnapshot;
  capturePhase: AutomaticCapturePhase;
  countdownRemainingMs: number;
  evaluation: OrchidFingerEvaluation | null;
  hasCompletedTrajectory: boolean;
}
export const ORCHID_FINGER_STILLNESS_DURATION_MS = 2_000;
export const ORCHID_FINGER_STILLNESS_THRESHOLD = 0.08;
export const ORCHID_FINGER_MINIMUM_RECORDING_MS = 15_600;
export const ORCHID_FINGER_MAXIMUM_DURATION_MS = 30_000;
export const ORCHID_FINGER_MAXIMUM_SAMPLES = 1_200;
const epochNow = () => performance.timeOrigin + performance.now();
const idleState = (): OrchidFingerLiveScoringState => ({ snapshot: { attemptId: null, status: "idle", tracking: "awaiting", bufferedSamples: 0, usableSamples: 0, elapsedMs: 0 }, capturePhase: "idle", countdownRemainingMs: 0, evaluation: null, hasCompletedTrajectory: false });

export function useOrchidFingerLiveScoring(sessionId: string | null) {
  const captureRef = useRef(new WaterSleevesAutomaticCapture({
    stillnessDurationMs: ORCHID_FINGER_STILLNESS_DURATION_MS,
    stillnessThreshold: ORCHID_FINGER_STILLNESS_THRESHOLD,
    minimumRecordingMs: ORCHID_FINGER_MINIMUM_RECORDING_MS,
    maximumDurationMs: ORCHID_FINGER_MAXIMUM_DURATION_MS,
    maximumSamples: ORCHID_FINGER_MAXIMUM_SAMPLES,
    motionEstimator: estimateOrchidFingerMotion,
  }));
  const framesRef = useRef<VisionLandmarkFrame[]>([]);
  const attemptSequence = useRef(0);
  const sessionRef = useRef(sessionId);
  const [state, setState] = useState<OrchidFingerLiveScoringState>(idleState);
  const publish = useCallback((nowMs = epochNow()) => {
    const capture = captureRef.current.advance(nowMs);
    const terminal = capture.phase === "completed" || capture.phase === "timed-out";
    const evaluation = terminal && capture.attemptId && framesRef.current.length
      ? evaluateOrchidFingerTrajectory(extractLiveOrchidFingerTrajectory(capture.attemptId, framesRef.current), ORCHID_FINGER_REFERENCE)
      : null;
    const status: LiveAttemptSnapshot["status"] = terminal ? capture.phase as "completed" | "timed-out" : capture.phase === "cancelled" ? "cancelled" : capture.attempt.status;
    setState((current) => ({ snapshot: { ...capture.attempt, attemptId: capture.attemptId, status }, capturePhase: capture.phase, countdownRemainingMs: capture.countdownRemainingMs, evaluation: evaluation ?? (terminal ? current.evaluation : null), hasCompletedTrajectory: terminal && framesRef.current.length > 0 }));
  }, []);
  const reset = useCallback(() => { captureRef.current.reset(); framesRef.current = []; setState(idleState()); }, []);
  useEffect(() => { if (sessionRef.current === sessionId) return; sessionRef.current = sessionId; const timer = window.setTimeout(reset, 0); return () => window.clearTimeout(timer); }, [reset, sessionId]);
  useEffect(() => { if (state.capturePhase !== "countdown") return; const timer = window.setInterval(() => publish(), 100); return () => window.clearInterval(timer); }, [publish, state.capturePhase]);
  const start = useCallback(() => { attemptSequence.current += 1; framesRef.current = []; captureRef.current.start(`${sessionId ?? "camera"}-orchid-finger-${attemptSequence.current}`, epochNow()); publish(); }, [publish, sessionId]);
  const finish = useCallback(() => { captureRef.current.finish(epochNow()); publish(); }, [publish]);
  const cancel = useCallback(() => { captureRef.current.cancel(); framesRef.current = []; publish(); }, [publish]);
  const onFrame = useCallback((frame: VisionLandmarkFrame) => { const before = captureRef.current.getSnapshot(frame.capturedAtMs).phase; if (before !== "countdown" && before !== "recording") return; const after = captureRef.current.push(frame); if (before === "recording" || after.phase === "recording") framesRef.current.push(frame); publish(frame.capturedAtMs); }, [publish]);
  return { state, start, finish, cancel, reset, onFrame };
}
