import { DevelopmentNav } from "../../app/DevelopmentNav";
import { CameraControls } from "./CameraControls";
import { CameraDiagnostics } from "./CameraDiagnostics";
import { CameraPreview } from "./CameraPreview";
import type { CameraLabRuntimeFactory } from "./cameraLabRuntime";
import { useCameraLab } from "./useCameraLab";
import "./cameraLab.css";

type CameraLabPageProps = {
  runtimeFactory?: CameraLabRuntimeFactory;
};

export function CameraLabPage({ runtimeFactory }: CameraLabPageProps) {
  const camera = useCameraLab(runtimeFactory);

  return (
    <main>
      <DevelopmentNav activePage="m1" />
      <header className="lab-page-header">
        <div>
          <p className="eyebrow">Opera Hero · Milestone M1</p>
          <h1>Camera laboratory</h1>
          <p className="lede">
            Validate camera acquisition and lifecycle independently from pose
            tracking, gestures, and gameplay.
          </p>
        </div>
        <div className="lab-safety-note">
          <span aria-hidden="true" />
          <p>
            <strong>Local preview only</strong>
            No recording or upload
          </p>
        </div>
      </header>

      <section className="camera-workbench" aria-label="Camera workbench">
        <div className="preview-column">
          <CameraPreview session={camera.session} status={camera.status} />
          <p className="preview-caption">
            The preview is mirrored to match a visitor’s expected reflection.
            Delivered settings come from the active camera track.
          </p>
        </div>
        <div className="control-column">
          <CameraControls
            devices={camera.devices}
            failureMessage={camera.failure?.message ?? null}
            loadingDevices={camera.loadingDevices}
            onCancelRecovery={camera.cancelRecovery}
            onRefresh={() => void camera.refreshDevices()}
            onRestart={() => void camera.restart()}
            onRetryNow={() => void camera.retryNow()}
            onSelectDevice={(deviceId) => void camera.selectDevice(deviceId)}
            onStart={() => void camera.start()}
            onStop={camera.stop}
            operationPending={camera.operationPending}
            recoveryAttempt={camera.recoveryAttempt}
            recoveryScheduled={camera.recoveryScheduled}
            selectedDeviceId={camera.selectedDeviceId}
            status={camera.status}
          />
          <CameraDiagnostics
            devices={camera.devices}
            failure={camera.failure}
            selectedDeviceId={camera.selectedDeviceId}
            session={camera.session}
            status={camera.status}
          />
        </div>
      </section>

      <footer>
        Increment 5 adds a positioning guide, aspect-ratio diagnostics, and
        bounded camera recovery. Landmark-based framing detection follows in M2.
      </footer>
    </main>
  );
}
