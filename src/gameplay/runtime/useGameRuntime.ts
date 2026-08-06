/**
 * The game runtime.
 *
 * Composes the real pipeline — camera → vision worker → automatic capture → gesture
 * evaluator — into the view model the screens render. This is the only module under
 * `src/gameplay/` that knows those parts exist.
 *
 * The three live-scoring hooks come from the camera laboratory on purpose: they carry the
 * capture policy M3 tuned per gesture (stillness thresholds, minimum recording windows,
 * sample caps) plus the evaluator wiring. Copying those constants here would fork them.
 * They would sit more naturally in `src/domain/gestures/live/`; moving them is the
 * scoring owner's call, and this file is the only thing that would need updating.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useOpeningDoorLiveScoring } from "../../labs/camera/useOpeningDoorLiveScoring";
import { useOrchidFingerLiveScoring } from "../../labs/camera/useOrchidFingerLiveScoring";
import { useWaterSleevesLiveScoring } from "../../labs/camera/useWaterSleevesLiveScoring";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import type { GameActions, GameScore, GameView, TrackingPrompt } from "../contract";
import {
  createFlowState,
  dwellProgress,
  flowReducer,
  type CapturePhase,
} from "./gameFlow";
import { isPresent, trackingPromptFor } from "./trackingPrompt";
import { useBoothCamera, type BoothCamera } from "./useBoothCamera";
import { useVisionFrames, type LatestFrame } from "./useVisionFrames";

const TICK_MS = 100;

export interface GameRuntime {
  view: GameView;
  actions: GameActions;
  camera: BoothCamera;
  /** Reads the newest landmark frame. A function, so nothing reads a ref while rendering. */
  read: () => LatestFrame;
  /** True once the worker is returning landmarks. */
  tracking: boolean;
}

export function useGameRuntime(
  videoRef: RefObject<HTMLVideoElement | null>,
): GameRuntime {
  const camera = useBoothCamera();
  const [flow, dispatch] = useReducer(flowReducer, undefined, createFlowState);
  const [trackingPrompt, setTrackingPrompt] = useState<TrackingPrompt>("step-into-frame");

  const sessionId = camera.session?.id ?? null;
  const orchidFinger = useOrchidFingerLiveScoring(sessionId);
  const openingDoor = useOpeningDoorLiveScoring(sessionId);
  const waterSleeves = useWaterSleevesLiveScoring(sessionId);

  const scorers = useMemo(
    () => ({
      "orchid-finger": orchidFinger,
      "opening-door": openingDoor,
      "water-sleeves": waterSleeves,
    }),
    [openingDoor, orchidFinger, waterSleeves],
  );

  const active = flow.gestureId ? scorers[flow.gestureId] : null;
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Only the gesture being performed consumes frames; the other two stay idle.
  const handleFrame = useCallback((frame: VisionLandmarkFrame) => {
    activeRef.current?.onFrame(frame);
  }, []);

  const vision = useVisionFrames(videoRef, Boolean(camera.session), handleFrame);
  const readFrame = vision.read;

  // Bind the stream to the single video element the whole runtime samples.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.srcObject = camera.session?.stream ?? null;
    if (camera.session) {
      void video.play().catch(() => undefined);
    }
    return () => {
      video.srcObject = null;
    };
  }, [camera.session, videoRef]);

  useEffect(() => {
    dispatch({ type: "camera", ready: camera.ready });
  }, [camera.ready]);

  // The runtime's only clock: presence sampling and screen dwell.
  useEffect(() => {
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const deltaMs = now - last;
      last = now;
      const snapshot = readFrame();
      const input = {
        assessment: snapshot.assessment,
        ageMs: snapshot.receivedAt === 0 ? Infinity : now - snapshot.receivedAt,
      };
      setTrackingPrompt((current) => {
        const next = trackingPromptFor(input);
        return next === current ? current : next;
      });
      dispatch({ type: "tick", deltaMs, present: isPresent(input) });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [readFrame]);

  // Follow the capture policy rather than second-guessing it.
  const capturePhase = (active?.state.capturePhase ?? "idle") as CapturePhase;
  const evaluation = active?.state.evaluation ?? null;
  useEffect(() => {
    dispatch({ type: "capture-phase", phase: capturePhase, score: toScore(evaluation) });
  }, [capturePhase, evaluation]);

  // Perform the capture side effects the flow machine asks for.
  useEffect(() => {
    if (flow.captureIntent === null) {
      return;
    }
    const scorer = activeRef.current;
    if (flow.captureIntent === "start") {
      scorer?.reset();
      scorer?.start();
    } else {
      scorer?.cancel();
      scorer?.reset();
    }
    dispatch({ type: "capture-handled" });
  }, [flow.captureIntent]);

  const actions = useMemo<GameActions>(
    () => ({
      start: () => dispatch({ type: "start" }),
      next: () => dispatch({ type: "next" }),
      retry: () => dispatch({ type: "retry" }),
      quit: () => {
        activeRef.current?.cancel();
        activeRef.current?.reset();
        dispatch({ type: "quit" });
      },
    }),
    [],
  );

  const view = useMemo<GameView>(
    () => ({
      screen: flow.screen,
      level: flow.level,
      gestureId: flow.gestureId,
      countdownSeconds:
        flow.screen === "countdown" && active
          ? Math.max(1, Math.ceil(active.state.countdownRemainingMs / 1000))
          : null,
      trackingPrompt,
      score: flow.screen === "result" ? flow.score : null,
      attemptKey: active?.state.snapshot.attemptId ?? flow.gestureId,
      message: flow.message,
      autoAdvance: dwellProgress(flow),
    }),
    [active, flow, trackingPrompt],
  );

  return {
    view,
    actions,
    camera,
    read: readFrame,
    tracking: vision.worker.status === "tracking",
  };
}

/**
 * Narrows an evaluation to the four values the visitor is allowed to see. Per-signal
 * scores, aligned-pair counts and warping diagnostics stay in the laboratory.
 */
function toScore(
  evaluation: {
    overallScore: number;
    movementCompleteness: number;
    trackingCoverage: number;
    trackingStatus: "good" | "limited" | "insufficient";
  } | null,
): GameScore | null {
  if (!evaluation) {
    return null;
  }
  return {
    overallScore: evaluation.overallScore,
    movementCompleteness: evaluation.movementCompleteness,
    trackingCoverage: evaluation.trackingCoverage,
    trackingStatus: evaluation.trackingStatus,
  };
}
