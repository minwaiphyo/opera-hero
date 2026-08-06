import { useState } from "react";
import { DevelopmentNav } from "../../app/DevelopmentNav";
import { CameraControls } from "./CameraControls";
import { CameraDiagnostics } from "./CameraDiagnostics";
import { CameraPreview } from "./CameraPreview";
import { CameraStabilityPanel } from "./CameraStabilityPanel";
import { OpeningDoorLiveScoringPanel } from "./OpeningDoorLiveScoringPanel";
import { OpeningDoorReferenceGuide } from "./OpeningDoorReferenceGuide";
import { OrchidFingerLiveScoringPanel } from "./OrchidFingerLiveScoringPanel";
import { OrchidFingerReferenceGuide } from "./OrchidFingerReferenceGuide";
import { WaterSleevesLiveScoringPanel } from "./WaterSleevesLiveScoringPanel";
import { WaterSleevesReferenceGuide } from "./WaterSleevesReferenceGuide";
import { WaterSleevesTuningPanel } from "./WaterSleevesTuningPanel";
import type { CameraLabRuntimeFactory } from "./cameraLabRuntime";
import { useCameraLab } from "./useCameraLab";
import { useOpeningDoorLiveScoring } from "./useOpeningDoorLiveScoring";
import { useOrchidFingerLiveScoring } from "./useOrchidFingerLiveScoring";
import { useWaterSleevesLiveScoring } from "./useWaterSleevesLiveScoring";
import "./cameraLab.css";

type CameraLabPageProps = {
  runtimeFactory?: CameraLabRuntimeFactory;
};

export function CameraLabPage({ runtimeFactory }: CameraLabPageProps) {
  const camera = useCameraLab(runtimeFactory);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [gesture, setGesture] = useState<"water-sleeves" | "opening-door" | "orchid-finger">("water-sleeves");
  const waterSleeves = useWaterSleevesLiveScoring(camera.session?.id ?? null);
  const openingDoor = useOpeningDoorLiveScoring(camera.session?.id ?? null);
  const orchidFinger = useOrchidFingerLiveScoring(camera.session?.id ?? null);
  const liveScoring = gesture === "water-sleeves" ? waterSleeves : gesture === "opening-door" ? openingDoor : orchidFinger;
  const attemptActive = liveScoring.state.capturePhase === "countdown" ||
    liveScoring.state.capturePhase === "recording";

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
          <label className="camera-select-label" htmlFor="gesture-lab-selector">
            Gesture laboratory
          </label>
          <select
            className="gesture-lab-selector"
            id="gesture-lab-selector"
            disabled={attemptActive}
            value={gesture}
            onChange={(event) => {
              waterSleeves.reset();
              openingDoor.reset();
              orchidFinger.reset();
              setGesture(event.target.value as "water-sleeves" | "opening-door" | "orchid-finger");
            }}
          >
            <option value="water-sleeves">Water Sleeves</option>
            <option value="opening-door">Opening Door</option>
            <option value="orchid-finger">Orchid Finger</option>
          </select>
          {gesture === "water-sleeves" ? (
            <WaterSleevesLiveScoringPanel
              cameraActive={Boolean(camera.session)}
              onCancel={waterSleeves.cancel}
              onFinish={waterSleeves.finish}
              onReset={waterSleeves.reset}
              onStart={waterSleeves.start}
              state={waterSleeves.state}
            />
          ) : gesture === "opening-door" ? (
            <OpeningDoorLiveScoringPanel
              cameraActive={Boolean(camera.session)}
              onCancel={openingDoor.cancel}
              onFinish={openingDoor.finish}
              onReset={openingDoor.reset}
              onStart={openingDoor.start}
              state={openingDoor.state}
            />
          ) : (
            <OrchidFingerLiveScoringPanel cameraActive={Boolean(camera.session)} onCancel={orchidFinger.cancel} onFinish={orchidFinger.finish} onReset={orchidFinger.reset} onStart={orchidFinger.start} state={orchidFinger.state} />
          )}
          <div className="live-visual-comparison">
            <CameraPreview
              onLandmarkFrame={gesture === "water-sleeves" ? waterSleeves.onFrame : gesture === "opening-door" ? openingDoor.onFrame : orchidFinger.onFrame}
              onVideoElement={setVideoElement}
              session={camera.session}
              status={camera.status}
            />
            {gesture === "water-sleeves" ? (
              <WaterSleevesReferenceGuide
                playbackEnabled={waterSleeves.state.capturePhase !== "countdown"}
                restartToken={waterSleeves.state.snapshot.attemptId}
              />
            ) : gesture === "opening-door" ? (
              <OpeningDoorReferenceGuide
                playbackEnabled={openingDoor.state.capturePhase !== "countdown"}
                restartToken={openingDoor.state.snapshot.attemptId}
              />
            ) : (
              <OrchidFingerReferenceGuide playbackEnabled={orchidFinger.state.capturePhase !== "countdown"} restartToken={orchidFinger.state.snapshot.attemptId} />
            )}
            <AttemptCaptureCue state={liveScoring.state} />
          </div>
          <p className="preview-caption">
            The preview is mirrored to match a visitor’s expected reflection.
            Delivered settings come from the active camera track.
          </p>
          {gesture === "water-sleeves" && (
            <WaterSleevesTuningPanel
              attemptId={waterSleeves.state.snapshot.attemptId}
              evaluation={waterSleeves.state.evaluation}
            />
          )}
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

function AttemptCaptureCue({
  state,
}: {
  state: {
    capturePhase: "idle" | "countdown" | "recording" | "completed" | "timed-out" | "cancelled";
    countdownRemainingMs: number;
  };
}) {
  if (state.capturePhase === "countdown") {
    return (
      <div className="attempt-capture-cue" role="status">
        <strong>{Math.max(1, Math.ceil(state.countdownRemainingMs / 1000))}</strong>
        <span>Move into the ready position</span>
      </div>
    );
  }
  if (state.capturePhase === "recording") {
    return (
      <div className="attempt-capture-cue recording" role="status">
        <strong>Recording</strong>
        <span>Hold your final position to finish</span>
      </div>
    );
  }
  return null;
}
