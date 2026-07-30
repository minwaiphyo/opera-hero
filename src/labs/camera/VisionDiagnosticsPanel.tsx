import type { VisionDiagnosticsSnapshot } from "../../vision/visionDiagnostics";
import type { VisionWorkerState } from "../../vision/visionWorkerClient";

interface VisionDiagnosticsPanelProps {
  worker: Extract<VisionWorkerState, { status: "tracking" }>;
  diagnostics: VisionDiagnosticsSnapshot;
}

export function VisionDiagnosticsPanel({
  worker,
  diagnostics,
}: VisionDiagnosticsPanelProps) {
  return (
    <aside
      aria-label="Vision worker diagnostics"
      className="vision-diagnostics"
    >
      <p>Worker diagnostics</p>
      <dl>
        <Metric
          label="Runtime"
          value={`MediaPipe ${worker.runtimeVersion}`}
        />
        <Metric
          label="Pipeline"
          value={`${worker.delegate} · Pose ${worker.poseModel}`}
        />
        <Metric
          label="Inference"
          value={`${milliseconds(diagnostics.latestInferenceMs)} latest`}
        />
        <Metric
          label="Inference p50 / p95"
          value={`${milliseconds(diagnostics.inferenceP50Ms)} / ${milliseconds(
            diagnostics.inferenceP95Ms,
          )}`}
        />
        <Metric
          label="Capture p50 / p95"
          value={`${milliseconds(
            diagnostics.captureToResultP50Ms,
          )} / ${milliseconds(diagnostics.captureToResultP95Ms)}`}
        />
        <Metric
          label="Effective rate"
          value={`${diagnostics.effectiveFps.toFixed(1)} FPS`}
        />
        <Metric
          label="Frames"
          value={`${diagnostics.completedFrames} completed / ${diagnostics.submittedFrames} submitted`}
        />
        <Metric
          label="Backpressure"
          value={`${diagnostics.replacedFrames} replaced · ${percentage(
            diagnostics.replacementRate,
          )}`}
        />
        <Metric
          label="Queue"
          value={`${diagnostics.inFlight ? "1 active" : "idle"} · ${
            diagnostics.pending ? "1 pending" : "none pending"
          }`}
        />
      </dl>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function milliseconds(value: number): string {
  return `${value.toFixed(1)} ms`;
}

function percentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
