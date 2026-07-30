import { useEffect, useRef, useState } from "react";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import {
  assessVisionTracking,
  type VisionTrackingAssessment,
} from "../../vision/visionQuality";
import type { ReplayAdapterSnapshot } from "../../vision/replay/replayVisionAdapter";
import { ReplayVisionAdapter } from "../../vision/replay/replayVisionAdapter";
import type { VisionReplayFixture } from "../../vision/replay/visionReplayTypes";

const EMPTY_ASSESSMENT: VisionTrackingAssessment = {
  presence: false,
  framing: "absent",
  score: 0,
  band: "lost",
  poseVisibility: 0,
  inFrameCoverage: 0,
  handsDetected: 0,
  upperBodyScale: 0,
};

export function useReplayLandmarkLab(fixture: VisionReplayFixture) {
  const adapterRef = useRef<ReplayVisionAdapter | null>(null);
  const [snapshot, setSnapshot] = useState<ReplayAdapterSnapshot>(() =>
    initialSnapshot(fixture),
  );
  const [frame, setFrame] = useState<VisionLandmarkFrame | null>(null);
  const [assessment, setAssessment] =
    useState<VisionTrackingAssessment>(EMPTY_ASSESSMENT);

  useEffect(() => {
    const adapter = new ReplayVisionAdapter(fixture);
    adapterRef.current = adapter;
    const unsubscribeFrames = adapter.subscribeFrames((nextFrame) => {
      setFrame(nextFrame);
      setAssessment(assessVisionTracking(nextFrame));
      setSnapshot(adapter.getSnapshot());
    });
    const unsubscribeState = adapter.subscribeState(() => {
      setSnapshot(adapter.getSnapshot());
    });

    return () => {
      unsubscribeFrames();
      unsubscribeState();
      adapter.dispose();
      if (adapterRef.current === adapter) {
        adapterRef.current = null;
      }
    };
  }, [fixture]);

  return {
    snapshot,
    frame,
    assessment,
    play: () => adapterRef.current?.start(),
    pause: () => adapterRef.current?.pause(),
    restart: () => adapterRef.current?.restart(),
    stop: () => adapterRef.current?.stop(),
    setPlaybackRate: (rate: number) =>
      adapterRef.current?.setPlaybackRate(rate),
  };
}

function initialSnapshot(
  fixture: VisionReplayFixture,
): ReplayAdapterSnapshot {
  return {
    kind: "replay",
    status: "idle",
    fixtureId: fixture.id,
    positionMs: 0,
    durationMs: fixture.frames.at(-1)?.offsetMs ?? 0,
    playbackRate: 1,
    emittedFrames: 0,
  };
}
