import { useEffect, useMemo, useState } from "react";
import guideDocument from "../../domain/gestures/references/waterSleeves.guide.json";
import { LandmarkReplayCanvas } from "../landmarks/LandmarkReplayCanvas";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import { parseVisionReplayFixture } from "../../vision/replay/visionReplayValidation";

const GUIDE = parseVisionReplayFixture(guideDocument);
const GUIDE_DURATION_MS = GUIDE.frames.at(-1)?.offsetMs ?? 7700;

export function WaterSleevesReferenceGuide({
  playbackEnabled = true,
  restartToken,
}: {
  playbackEnabled?: boolean;
  restartToken: string | null;
}) {
  const [revision, setRevision] = useState(0);

  return (
    <GuidePlayback
      key={`${restartToken ?? "idle"}-${revision}`}
      onRestart={() => setRevision((value) => value + 1)}
      playbackEnabled={playbackEnabled}
    />
  );
}

function GuidePlayback({
  onRestart,
  playbackEnabled,
}: {
  onRestart: () => void;
  playbackEnabled: boolean;
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!playbackEnabled) return;

    const frameIntervalMs = GUIDE_DURATION_MS / Math.max(1, GUIDE.frames.length - 1);
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % GUIDE.frames.length);
    }, frameIntervalMs);
    return () => window.clearInterval(timer);
  }, [playbackEnabled]);

  const frame = useMemo(() => normalizedFrame(frameIndex), [frameIndex]);
  const progress = GUIDE.frames[frameIndex]!.offsetMs / GUIDE_DURATION_MS;

  return (
    <section className="reference-guide" aria-labelledby="reference-guide-title">
      <div className="reference-guide-stage">
        <LandmarkReplayCanvas frame={frame} />
        <span className="reference-guide-badge">Practitioner reference</span>
        <div className="reference-guide-progress" aria-hidden="true">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <div className="reference-guide-caption">
        <div>
          <strong id="reference-guide-title">Follow this movement</strong>
          <span>Pose-only guide · loops every 7.7 seconds</span>
        </div>
        <button onClick={onRestart} type="button">
          Replay guide
        </button>
      </div>
    </section>
  );
}

function normalizedFrame(index: number): VisionLandmarkFrame {
  const frame = GUIDE.frames[index]!;
  return {
    frameId: index,
    capturedAtMs: frame.offsetMs,
    completedAtMs: frame.offsetMs,
    ...(frame.pose ? { pose: frame.pose } : {}),
    hands: [],
    timing: { poseMs: 0, handsMs: 0, totalMs: 0 },
  };
}
