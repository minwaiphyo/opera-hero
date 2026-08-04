import { useState } from "react";
import { DevelopmentNav } from "../../app/DevelopmentNav";
import { CameraControls } from "./CameraControls";
import { CameraDiagnostics } from "./CameraDiagnostics";
import { CameraPreview } from "./CameraPreview";
import { CameraStabilityPanel } from "./CameraStabilityPanel";
import { WaterSleevesLiveScoringPanel } from "./WaterSleevesLiveScoringPanel";
import { WaterSleevesReferenceGuide } from "./WaterSleevesReferenceGuide";
import { WaterSleevesTuningPanel } from "./WaterSleevesTuningPanel";
import type { CameraLabRuntimeFactory } from "./cameraLabRuntime";
import { useCameraLab } from "./useCameraLab";
import { useWaterSleevesLiveScoring } from "./useWaterSleevesLiveScoring";
import "./cameraLab.css";

type CameraLabPageProps = {
  runtimeFactory?: CameraLabRuntimeFactory;
};

export function CameraLabPage({ runtimeFactory }: CameraLabPageProps) {
  const camera = useCameraLab(runtimeFactory);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const liveScoring = useWaterSleevesLiveScoring(camera.session?.id ?? null);

  return (
    <main className="camera-lab-page">
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
          <WaterSleevesLiveScoringPanel
            cameraActive={Boolean(camera.session)}
            onCancel={liveScoring.cancel}
            onFinish={liveScoring.finish}
            onReset={liveScoring.reset}
            onStart={liveScoring.start}
            state={liveScoring.state}
          />
          <div className="live-visual-comparison">
            <CameraPreview
              onLandmarkFrame={liveScoring.onFrame}
              onVideoElement={setVideoElement}
              session={camera.session}
              status={camera.status}
            />
            <WaterSleevesReferenceGuide
              restartToken={liveScoring.state.snapshot.attemptId}
            />
          </div>
          <p className="preview-caption">
            The preview is mirrored to match a visitor’s expected reflection.
            Delivered settings come from the active camera track.
          </p>
          <WaterSleevesTuningPanel
            attemptId={liveScoring.state.snapshot.attemptId}
            evaluation={liveScoring.state.evaluation}
          />
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
          <CameraStabilityPanel
            key={camera.session?.id ?? "idle"}
            session={camera.session}
            videoElement={videoElement}
          />
        </div>
      </section>

      <footer>
        M1 validates acquisition, framing, cleanup, recovery, and long-running
        camera stability before landmark processing begins in M2.
      </footer>
    </main>
  );
}
