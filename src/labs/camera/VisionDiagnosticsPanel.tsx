import type { VisionDiagnosticsSnapshot } from "../../vision/visionDiagnostics";
import { VISION_INFERENCE_MAX_EDGE_PX } from "../../vision/visionCapture";
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
      <details>
        <summary>
          <span>Worker</span>
          <strong>{diagnostics.effectiveFps.toFixed(1)} FPS</strong>
        </summary>
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
          label="Inference input"
          value={`Aspect-fit · max ${VISION_INFERENCE_MAX_EDGE_PX} px`}
        />
        <Metric
          label="Presence / framing"
          value={`${diagnostics.presence ? "present" : "absent"} · ${formatLabel(
            diagnostics.framing,
          )}`}
        />
        <Metric
          label="Tracking quality"
          value={`${percentage(diagnostics.trackingQuality)} · ${diagnostics.trackingBand}`}
        />
        <Metric
          label="Pose visibility"
          value={percentage(diagnostics.poseVisibility)}
        />
        <Metric
          label="Hands / coverage"
          value={`${diagnostics.handsDetected}/2 · ${percentage(
            diagnostics.inFrameCoverage,
          )}`}
        />
        <Metric
          label="Upper-body scale"
          value={diagnostics.upperBodyScale.toFixed(3)}
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
      </details>
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

function formatLabel(value: string): string {
  return value.replaceAll("-", " ");
}
