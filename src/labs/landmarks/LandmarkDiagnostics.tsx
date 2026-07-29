import type {
  LandmarkFrame,
  VisionCapabilities,
} from "../../vision/landmarkTypes";
import type { LandmarkLabStatus } from "./useLandmarkLab";

type LandmarkDiagnosticsProps = {
  status: LandmarkLabStatus;
  capabilities: VisionCapabilities | null;
  frame: LandmarkFrame | null;
  processedFrames: number;
  skippedFrames: number;
  error: string | null;
};

export function LandmarkDiagnostics({
  status,
  capabilities,
  frame,
  processedFrames,
  skippedFrames,
  error,
}: LandmarkDiagnosticsProps) {
  return (
    <section className="lab-panel" aria-labelledby="landmark-diagnostics-title">
      <div className="lab-panel-heading">
        <div>
          <p className="check-kicker">Contract diagnostics</p>
          <h2 id="landmark-diagnostics-title">Landmark stream</h2>
        </div>
        <span className={`lab-status status-${status}`}>{status}</span>
      </div>

      {error && <p className="vision-error" role="alert">{error}</p>}

      <dl className="diagnostic-list">
        <Diagnostic label="Adapter" value={capabilities?.adapter ?? "—"} />
        <Diagnostic label="Runtime" value={capabilities?.runtime ?? "—"} />
        <Diagnostic label="Model" value={capabilities?.model ?? "—"} />
        <Diagnostic label="Frame" value={frame ? String(frame.frameId) : "—"} />
        <Diagnostic
          label="Pose landmarks"
          value={String(frame?.pose?.landmarks.length ?? 0)}
        />
        <Diagnostic label="Hands" value={String(frame?.hands.length ?? 0)} />
        <Diagnostic
          label="Tracking quality"
          value={frame ? `${Math.round(frame.trackingQuality * 100)}%` : "—"}
        />
        <Diagnostic label="Framing" value={frame?.framing ?? "—"} />
        <Diagnostic label="Processed" value={String(processedFrames)} />
        <Diagnostic label="Skipped" value={String(skippedFrames)} />
        <Diagnostic
          label="Inference"
          value={frame ? `${frame.inferenceDurationMs.toFixed(1)} ms` : "—"}
        />
        <Diagnostic
          label="Timestamp"
          value={frame ? `${frame.timestampMs.toFixed(1)} ms` : "—"}
        />
      </dl>
    </section>
  );
}

function Diagnostic({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
