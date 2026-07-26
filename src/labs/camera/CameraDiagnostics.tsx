import { useEffect, useState } from "react";
import { DEFAULT_CAMERA_CONFIG } from "../../camera/cameraConstraints";
import type {
  CameraDevice,
  CameraFailure,
  CameraSession,
  CameraStatus,
} from "../../camera/cameraTypes";

type CameraDiagnosticsProps = {
  devices: CameraDevice[];
  selectedDeviceId: string;
  session: CameraSession | null;
  status: CameraStatus;
  failure: CameraFailure | null;
};

export function CameraDiagnostics({
  devices,
  selectedDeviceId,
  session,
  status,
  failure,
}: CameraDiagnosticsProps) {
  const [clockNow, setClockNow] = useState(0);

  useEffect(() => {
    if (!session) {
      return;
    }

    const interval = window.setInterval(
      () => setClockNow(performance.now()),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [session]);

  const uptimeSeconds = session && clockNow >= session.startedAt
    ? Math.floor((clockNow - session.startedAt) / 1000)
    : 0;
  const selectedDevice = devices.find(
    (device) => device.deviceId === selectedDeviceId,
  );

  return (
    <section
      className="lab-panel diagnostics-panel"
      aria-labelledby="diagnostics-title"
    >
      <div className="lab-panel-heading">
        <div>
          <p className="check-kicker">Live diagnostics</p>
          <h2 id="diagnostics-title">Stream details</h2>
        </div>
      </div>

      {failure && (
        <div className="camera-failure" role="alert">
          <strong>{failure.code}</strong>
          <p>{failure.message}</p>
          <small>
            {failure.recoverable
              ? "A retry may succeed."
              : "Technician action is required before retrying."}
          </small>
        </div>
      )}

      <dl className="diagnostic-list">
        <Diagnostic label="State" value={status} />
        <Diagnostic
          label="Selected"
          value={selectedDevice?.label ?? "Browser default"}
        />
        <Diagnostic
          label="Requested"
          value={`${DEFAULT_CAMERA_CONFIG.idealWidth} × ${DEFAULT_CAMERA_CONFIG.idealHeight} @ ${DEFAULT_CAMERA_CONFIG.idealFrameRate} FPS`}
        />
        <Diagnostic
          label="Delivered"
          value={formatDeliveredSettings(session)}
        />
        <Diagnostic
          label="Facing mode"
          value={session?.settings.facingMode ?? "—"}
        />
        <Diagnostic label="Uptime" value={`${uptimeSeconds}s`} />
        <Diagnostic
          label="Session"
          value={session ? shorten(session.id) : "—"}
        />
        <Diagnostic
          label="Device ID"
          value={session?.settings.deviceId ? shorten(session.settings.deviceId) : "—"}
        />
      </dl>

      <p className="privacy-note">
        The preview remains inside this browser. This laboratory does not
        record, upload, or store camera frames.
      </p>
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

function formatDeliveredSettings(session: CameraSession | null): string {
  if (!session) {
    return "—";
  }

  const { width, height, frameRate } = session.settings;
  const dimensions = width && height ? `${width} × ${height}` : "Unknown size";
  const rate = frameRate ? `${formatNumber(frameRate)} FPS` : "Unknown FPS";
  return `${dimensions} @ ${rate}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function shorten(value: string): string {
  return value.length <= 14 ? value : `${value.slice(0, 6)}…${value.slice(-5)}`;
}
