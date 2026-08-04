import type { OpeningDoorLiveScoringState } from "./useOpeningDoorLiveScoring";

const signalLabels = {
  leftElbowPosition: "Left elbow path",
  rightElbowPosition: "Right elbow path",
  leftWristPosition: "Left wrist path",
  rightWristPosition: "Right wrist path",
  leftPalmPosition: "Left palm path",
  rightPalmPosition: "Right palm path",
  leftPalmDirection: "Left palm direction",
  rightPalmDirection: "Right palm direction",
  leftHandOpenness: "Left hand openness",
  rightHandOpenness: "Right hand openness",
} as const;

export function OpeningDoorLiveScoringPanel({
  cameraActive,
  state,
  onStart,
  onFinish,
  onCancel,
  onReset,
}: {
  cameraActive: boolean;
  state: OpeningDoorLiveScoringState;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  const recording = state.capturePhase === "recording";
  const active = state.capturePhase === "countdown" || recording;
  return (
    <section className="lab-panel live-scoring-panel" aria-labelledby="opening-door-live-title">
      <div className="live-scoring-heading">
        <div>
          <p className="eyebrow">M3 developer tool</p>
          <h2 id="opening-door-live-title">Opening Door live scoring</h2>
        </div>
        <span className={`lab-status scoring-${state.capturePhase}`}>
          {state.capturePhase.replaceAll("-", " ")}
        </span>
        <div className="lab-button-row live-scoring-actions">
          <button className="primary-button" disabled={!cameraActive || active} onClick={onStart}>Start attempt</button>
          <button disabled={!recording} onClick={onFinish}>Manual finish</button>
          <button disabled={!active} onClick={onCancel}>Cancel</button>
          <button disabled={active || state.capturePhase === "idle"} onClick={onReset}>Reset</button>
        </div>
      </div>
      <p className="live-scoring-copy">
        Capture one Opening Door movement from the worker landmark stream. No video is stored.
      </p>
      <dl className="live-scoring-metrics">
        <div><dt>Tracking</dt><dd>{state.snapshot.tracking}</dd></div>
        <div><dt>Elapsed</dt><dd>{(state.snapshot.elapsedMs / 1000).toFixed(1)} s</dd></div>
        <div><dt>Buffered</dt><dd>{state.snapshot.bufferedSamples}</dd></div>
        <div><dt>Usable</dt><dd>{state.snapshot.usableSamples}</dd></div>
      </dl>
      {!cameraActive && <p className="scoring-guidance">Start the camera before recording an attempt.</p>}
      {recording && <p className="scoring-guidance">Recording started. Hold the final position to finish automatically.</p>}
      {state.evaluation && (
        <div className="live-score-result" aria-label="Opening Door score result">
          <div className="live-score-primary">
            <span>Soft similarity</span>
            <strong>{percent(state.evaluation.overallScore)}</strong>
            <small>No visitor pass threshold has been approved.</small>
          </div>
          <dl className="live-scoring-metrics">
            <div><dt>Tracking coverage</dt><dd>{percent(state.evaluation.trackingCoverage)}</dd></div>
            <div><dt>Tracking status</dt><dd>{state.evaluation.trackingStatus}</dd></div>
            <div><dt>Aligned pairs</dt><dd>{state.evaluation.alignedPairs}</dd></div>
          </dl>
          <ul className="signal-score-list">
            {Object.entries(state.evaluation.signalScores).map(([signal, result]) => (
              <li key={signal}>
                <span>{signalLabels[signal as keyof typeof signalLabels]}</span>
                <strong>{result.score === null ? "Unavailable" : percent(result.score)}</strong>
                <small>{percent(result.coverage)} coverage</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
