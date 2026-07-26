import type { CameraDevice, CameraStatus } from "../../camera/cameraTypes";

type CameraControlsProps = {
  devices: CameraDevice[];
  selectedDeviceId: string;
  status: CameraStatus;
  loadingDevices: boolean;
  operationPending: boolean;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onRefresh: () => void;
  onSelectDevice: (deviceId: string) => void;
};

export function CameraControls({
  devices,
  selectedDeviceId,
  status,
  loadingDevices,
  operationPending,
  onStart,
  onStop,
  onRestart,
  onRefresh,
  onSelectDevice,
}: CameraControlsProps) {
  const active = status === "active";
  const transitional =
    operationPending ||
    status === "requesting-permission" ||
    status === "starting" ||
    status === "recovering";

  return (
    <section className="lab-panel controls-panel" aria-labelledby="controls-title">
      <div className="lab-panel-heading">
        <div>
          <p className="check-kicker">Stream control</p>
          <h2 id="controls-title">Camera source</h2>
        </div>
        <span className={`lab-status status-${status}`}>{status}</span>
      </div>

      <label className="camera-select-label" htmlFor="camera-device">
        Available camera
      </label>
      <div className="camera-select-row">
        <select
          disabled={loadingDevices || transitional}
          id="camera-device"
          onChange={(event) => onSelectDevice(event.target.value)}
          value={selectedDeviceId}
        >
          {devices.length === 0 && <option value="">Browser default camera</option>}
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
        <button
          className="secondary-button"
          disabled={loadingDevices || transitional}
          onClick={onRefresh}
          type="button"
        >
          Refresh
        </button>
      </div>

      <p className="control-note">
        {loadingDevices
          ? "Checking connected cameras…"
          : `${devices.length} camera${devices.length === 1 ? "" : "s"} detected. Names may appear only after permission is granted.`}
      </p>

      <div className="button-row lab-button-row">
        <button
          className="primary-button"
          disabled={active || transitional}
          onClick={onStart}
          type="button"
        >
          Start camera
        </button>
        <button
          className="secondary-button"
          disabled={!active || transitional}
          onClick={onRestart}
          type="button"
        >
          Restart
        </button>
        <button
          className="secondary-button"
          disabled={!active && !transitional}
          onClick={onStop}
          type="button"
        >
          Stop
        </button>
      </div>
    </section>
  );
}
