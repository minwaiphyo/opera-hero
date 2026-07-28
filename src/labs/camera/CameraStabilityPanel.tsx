import { useEffect, useMemo, useState } from "react";
import {
  calculateCameraStability,
  type CameraStabilitySample,
} from "../../camera/cameraStability";
import type { CameraSession } from "../../camera/cameraTypes";

const SOAK_TARGET_MS = 60 * 60 * 1000;
const MAX_SAMPLES = 60 * 60 + 2;

type CameraStabilityPanelProps = {
  session: CameraSession | null;
  videoElement: HTMLVideoElement | null;
};

export function CameraStabilityPanel({
  session,
  videoElement,
}: CameraStabilityPanelProps) {
  const [samples, setSamples] = useState<CameraStabilitySample[]>([]);
  const [observedAtMs, setObservedAtMs] = useState(() => performance.now());

  useEffect(() => {
    if (!session || !videoElement) {
      return;
    }

    const interval = window.setInterval(() => {
      const sample = readStabilitySample(videoElement);
      setObservedAtMs(sample.capturedAtMs);
      setSamples((current) => [...current.slice(-(MAX_SAMPLES - 1)), sample]);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session, videoElement]);

  const metrics = useMemo(() => calculateCameraStability(samples), [samples]);
  const soakElapsedMs = session
    ? Math.max(0, observedAtMs - session.startedAt)
    : 0;
  const soakProgress = Math.min(100, (soakElapsedMs / SOAK_TARGET_MS) * 100);
  const state = stabilityState(session, samples.length, metrics.stalledSamples);

  return (
    <section
      className="lab-panel stability-panel"
      aria-labelledby="stability-title"
    >
      <div className="lab-panel-heading">
        <div>
          <p className="check-kicker">Reliability validation</p>
          <h2 id="stability-title">Stability monitor</h2>
        </div>
        <span className={`lab-status stability-${state}`}>{state}</span>
      </div>

      <div
        aria-label={`${formatDuration(soakElapsedMs)} of 60:00 soak target`}
        className="soak-progress"
        role="progressbar"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.floor(soakProgress)}
      >
        <span style={{ width: `${soakProgress}%` }} />
      </div>
      <p className="soak-caption">
        Soak duration <strong>{formatDuration(soakElapsedMs)}</strong> / 60:00
      </p>

      <dl className="diagnostic-list stability-list">
        <Diagnostic
          label="Observed FPS"
          value={samples.length > 1 ? formatNumber(metrics.observedFrameRate) : "—"}
        />
        <Diagnostic label="Rendered frames" value={String(metrics.renderedFrames)} />
        <Diagnostic label="Dropped frames" value={String(metrics.droppedFrames)} />
        <Diagnostic
          label="Drop rate"
          value={`${(metrics.droppedFrameRate * 100).toFixed(2)}%`}
        />
        <Diagnostic label="Stalled samples" value={String(metrics.stalledSamples)} />
        <Diagnostic
          label="Heap trend"
          value={formatHeapTrend(metrics.initialHeapBytes, metrics.currentHeapBytes)}
        />
      </dl>

      <p className="stability-note">
        Keep this page visible during the one-hour test. Background tabs may be
        throttled by Chrome and should not be counted as camera instability.
      </p>
    </section>
  );
}

function readStabilitySample(
  videoElement: HTMLVideoElement,
): CameraStabilitySample {
  const quality = videoElement.getVideoPlaybackQuality?.();
  const memory = (
    performance as Performance & {
      memory?: { usedJSHeapSize?: number };
    }
  ).memory;

  return {
    capturedAtMs: performance.now(),
    totalVideoFrames: quality?.totalVideoFrames ?? 0,
    droppedVideoFrames: quality?.droppedVideoFrames ?? 0,
    ...(memory?.usedJSHeapSize === undefined
      ? {}
      : { usedHeapBytes: memory.usedJSHeapSize }),
  };
}

function stabilityState(
  session: CameraSession | null,
  sampleCount: number,
  stalledSamples: number,
): "idle" | "collecting" | "stable" | "attention" {
  if (!session) {
    return "idle";
  }
  if (sampleCount < 2) {
    return "collecting";
  }
  return stalledSamples === 0 ? "stable" : "attention";
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatHeapTrend(
  initialHeapBytes?: number,
  currentHeapBytes?: number,
): string {
  if (initialHeapBytes === undefined || currentHeapBytes === undefined) {
    return "Unavailable";
  }

  const changeMb = (currentHeapBytes - initialHeapBytes) / (1024 * 1024);
  const sign = changeMb > 0 ? "+" : "";
  return `${sign}${changeMb.toFixed(1)} MB`;
}

function Diagnostic({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
