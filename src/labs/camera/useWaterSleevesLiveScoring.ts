import { useCallback, useEffect, useRef, useState } from "react";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import {
  WaterSleevesAttemptBuffer,
  type LiveAttemptSnapshot,
} from "../../domain/gestures/live/waterSleevesAttemptBuffer";
import { WATER_SLEEVES_REFERENCE } from "../../domain/gestures/references/waterSleevesReference";
import {
  evaluateWaterSleevesTrajectory,
  type WaterSleevesEvaluation,
} from "../../domain/gestures/scoring/waterSleevesEvaluator";

export interface WaterSleevesLiveScoringState {
  snapshot: LiveAttemptSnapshot;
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
  evaluation: null,
  hasCompletedTrajectory: false,
};

export function useWaterSleevesLiveScoring(sessionId: string | null) {
  const bufferRef = useRef(new WaterSleevesAttemptBuffer());
  const attemptSequence = useRef(0);
  const evaluatedStatusRef = useRef<string | null>(null);
  const [state, setState] = useState<WaterSleevesLiveScoringState>(IDLE_STATE);

  const publish = useCallback(() => {
    const buffer = bufferRef.current;
    const snapshot = buffer.getSnapshot();
    const trajectory = buffer.getTrajectory();
    let evaluation: WaterSleevesEvaluation | null = null;
    if (trajectory && evaluatedStatusRef.current === snapshot.status) {
      evaluation = evaluateWaterSleevesTrajectory(
        trajectory,
        WATER_SLEEVES_REFERENCE,
      );
    } else if (
      trajectory &&
      (snapshot.status === "completed" || snapshot.status === "timed-out")
    ) {
      evaluatedStatusRef.current = snapshot.status;
      evaluation = evaluateWaterSleevesTrajectory(
        trajectory,
        WATER_SLEEVES_REFERENCE,
      );
    }
    setState({
      snapshot,
      evaluation,
      hasCompletedTrajectory: trajectory !== null,
    });
  }, []);

  const reset = useCallback(() => {
    bufferRef.current.reset();
    evaluatedStatusRef.current = null;
    setState(stateFromBuffer(bufferRef.current));
  }, []);

  useEffect(() => reset(), [reset, sessionId]);

  const start = useCallback(() => {
    attemptSequence.current += 1;
    evaluatedStatusRef.current = null;
    bufferRef.current.start(
      `${sessionId ?? "camera"}-${attemptSequence.current}`,
      epochNow(),
    );
    publish();
  }, [publish, sessionId]);

  const finish = useCallback(() => {
    bufferRef.current.finish(epochNow());
    publish();
  }, [publish]);

  const cancel = useCallback(() => {
    bufferRef.current.cancel();
    evaluatedStatusRef.current = null;
    publish();
  }, [publish]);

  const onFrame = useCallback(
    (frame: VisionLandmarkFrame) => {
      if (bufferRef.current.getSnapshot().status !== "recording") return;
      bufferRef.current.push(frame);
      publish();
    },
    [publish],
  );

  return { state, start, finish, cancel, reset, onFrame };
}

function stateFromBuffer(
  buffer: WaterSleevesAttemptBuffer,
): WaterSleevesLiveScoringState {
  return {
    snapshot: buffer.getSnapshot(),
    evaluation: null,
    hasCompletedTrajectory: false,
  };
}
