import { useEffect, useMemo, useState } from "react";
import guideDocument from "../../domain/gestures/references/openingDoor.guide.json";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import { parseVisionReplayFixture } from "../../vision/replay/visionReplayValidation";
import { LandmarkReplayCanvas } from "../landmarks/LandmarkReplayCanvas";

const GUIDE = parseVisionReplayFixture(guideDocument);
const GUIDE_DURATION_MS = GUIDE.frames.at(-1)?.offsetMs ?? 8700;

export function OpeningDoorReferenceGuide({
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
      playbackEnabled={playbackEnabled}
      onRestart={() => setRevision((value) => value + 1)}
    />
  );
}

function GuidePlayback({
  playbackEnabled,
  onRestart,
}: {
  playbackEnabled: boolean;
  onRestart: () => void;
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  useEffect(() => {
    if (!playbackEnabled) return;
    const intervalMs = GUIDE_DURATION_MS / Math.max(1, GUIDE.frames.length - 1);
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % GUIDE.frames.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [playbackEnabled]);
  const frame = useMemo(() => normalizedFrame(frameIndex), [frameIndex]);
  const progress = GUIDE.frames[frameIndex]!.offsetMs / GUIDE_DURATION_MS;
  return (
    <section className="reference-guide" aria-labelledby="opening-door-guide-title">
      <div className="reference-guide-stage">
        <LandmarkReplayCanvas frame={frame} />
        <span className="reference-guide-badge">Opening Door reference</span>
        <div className="reference-guide-progress" aria-hidden="true">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <div className="reference-guide-caption">
        <div>
          <strong id="opening-door-guide-title">Follow Opening Door</strong>
          <span>Pose-and-hand guide · loops every 8.7 seconds</span>
        </div>
        <button onClick={onRestart} type="button">Replay guide</button>
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
    hands: frame.hands,
    timing: { poseMs: 0, handsMs: 0, totalMs: 0 },
  };
}
