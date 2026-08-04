import type { WaterSleevesLiveScoringState } from "./useWaterSleevesLiveScoring";

interface WaterSleevesLiveScoringPanelProps {
  cameraActive: boolean;
  state: WaterSleevesLiveScoringState;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onReset: () => void;
}

const signalLabels = {
  leftUpperArmAngle: "Left upper arm",
  rightUpperArmAngle: "Right upper arm",
  leftElbowPosition: "Left elbow path",
  rightElbowPosition: "Right elbow path",
} as const;

export function WaterSleevesLiveScoringPanel({
  cameraActive,
  state,
  onStart,
  onFinish,
  onCancel,
  onReset,
}: WaterSleevesLiveScoringPanelProps) {
  const { snapshot, evaluation } = state;
  const recording = state.capturePhase === "recording";
  const active =
    state.capturePhase === "countdown" ||
    recording;

  return (
    <section className="lab-panel live-scoring-panel" aria-labelledby="live-scoring-title">
      <div className="live-scoring-heading">
        <div>
          <p className="eyebrow">M3 developer tool</p>
          <h2 id="live-scoring-title">Water Sleeves live scoring</h2>
        </div>
        <span className={`lab-status scoring-${state.capturePhase}`}>
          {state.capturePhase.replaceAll("-", " ")}
        </span>
        <div className="lab-button-row live-scoring-actions">
          <button className="primary-button" disabled={!cameraActive || active} onClick={onStart}>
            Start attempt
          </button>
          <button disabled={!recording} onClick={onFinish}>Manual finish</button>
          <button disabled={!active} onClick={onCancel}>Cancel</button>
          <button disabled={active || state.capturePhase === "idle"} onClick={onReset}>Reset</button>
        </div>
      </div>
      <p className="live-scoring-copy">
        Record one movement from the existing landmark stream, then compare its
        pose-arm trajectory with the practitioner reference. No video is stored.
      </p>

      <dl className="live-scoring-metrics">
        <div><dt>Tracking</dt><dd>{snapshot.tracking}</dd></div>
        <div><dt>Elapsed</dt><dd>{(snapshot.elapsedMs / 1000).toFixed(1)} s</dd></div>
        <div><dt>Buffered</dt><dd>{snapshot.bufferedSamples}</dd></div>
        <div><dt>Usable</dt><dd>{snapshot.usableSamples}</dd></div>
      </dl>

      {!cameraActive && <p className="scoring-guidance">Start the camera before recording an attempt.</p>}
      {recording && (
        <p className="scoring-guidance">Recording started. Hold the final position to finish automatically.</p>
      )}
      {snapshot.status === "completed" && !state.hasCompletedTrajectory && (
        <p className="scoring-guidance">No usable pose-arm tracking was captured. Reset and retry in full view.</p>
      )}
      {snapshot.status === "timed-out" && (
        <p className="scoring-guidance">The 20-second capture limit was reached automatically.</p>
      )}

      {evaluation && (
        <div className="live-score-result" aria-label="Water Sleeves score result">
          <div className="live-score-primary">
            <span>Soft similarity</span>
            <strong>{percent(evaluation.overallScore)}</strong>
            <small>No visitor pass threshold has been approved.</small>
          </div>
          <dl className="live-scoring-metrics">
            <div><dt>Tracking coverage</dt><dd>{percent(evaluation.trackingCoverage)}</dd></div>
            <div><dt>Movement completeness</dt><dd>{percent(evaluation.movementCompleteness)}</dd></div>
            <div><dt>Tracking status</dt><dd>{evaluation.trackingStatus}</dd></div>
            <div><dt>Aligned pairs</dt><dd>{evaluation.alignedPairs}</dd></div>
          </dl>
          <ul className="signal-score-list">
            {Object.entries(evaluation.signalScores).map(([signal, result]) => (
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
