import { useEffect, useMemo, useState } from "react";
import guideDocument from "../../domain/gestures/references/orchidFinger.guide.json";
import { parseVisionReplayFixture } from "../../vision/replay/visionReplayValidation";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import { LandmarkReplayCanvas } from "../landmarks/LandmarkReplayCanvas";

const GUIDE = parseVisionReplayFixture(guideDocument);
const DURATION_MS = GUIDE.frames.at(-1)?.offsetMs ?? 1;
export function OrchidFingerReferenceGuide({ playbackEnabled = true, restartToken }: { playbackEnabled?: boolean; restartToken: string | null }) {
  const [revision, setRevision] = useState(0);
  return <GuidePlayback key={`${restartToken ?? "idle"}-${revision}`} playbackEnabled={playbackEnabled} onRestart={() => setRevision((value) => value + 1)} />;
}
function GuidePlayback({ playbackEnabled, onRestart }: { playbackEnabled: boolean; onRestart: () => void }) {
  const [frameIndex, setFrameIndex] = useState(0);
  useEffect(() => { if (!playbackEnabled) return; const timer = window.setInterval(() => setFrameIndex((current) => (current + 1) % GUIDE.frames.length), DURATION_MS / Math.max(1, GUIDE.frames.length - 1)); return () => window.clearInterval(timer); }, [playbackEnabled]);
  const frame = useMemo(() => normalizedFrame(frameIndex), [frameIndex]);
  return <section className="reference-guide" aria-labelledby="orchid-finger-guide-title"><div className="reference-guide-stage"><LandmarkReplayCanvas frame={frame} /><span className="reference-guide-badge">Orchid Finger reference</span><div className="reference-guide-progress" aria-hidden="true"><span style={{ width: `${GUIDE.frames[frameIndex]!.offsetMs / DURATION_MS * 100}%` }} /></div></div><div className="reference-guide-caption"><div><strong id="orchid-finger-guide-title">Follow Orchid Finger</strong><span>Pose-and-hand guide · loops every {(DURATION_MS / 1000).toFixed(1)} seconds</span></div><button onClick={onRestart} type="button">Replay guide</button></div></section>;
}
function normalizedFrame(index: number): VisionLandmarkFrame { const frame = GUIDE.frames[index]!; return { frameId: index, capturedAtMs: frame.offsetMs, completedAtMs: frame.offsetMs, ...(frame.pose ? { pose: frame.pose } : {}), hands: frame.hands, timing: { poseMs: 0, handsMs: 0, totalMs: 0 } }; }
