import { useState } from "react";
import { DevelopmentNav } from "../../app/DevelopmentNav";
import type { VisionAdapterFactory } from "../../vision/visionAdapter";
import { LandmarkDiagnostics } from "./LandmarkDiagnostics";
import { LandmarkPreview } from "./LandmarkPreview";
import { useLandmarkLab } from "./useLandmarkLab";
import "../camera/cameraLab.css";
import "./landmarkLab.css";

type LandmarkLabPageProps = {
  adapterFactory?: VisionAdapterFactory;
};

export function LandmarkLabPage({ adapterFactory }: LandmarkLabPageProps) {
  const vision = useLandmarkLab(adapterFactory);
  const [showPose, setShowPose] = useState(true);
  const [showHands, setShowHands] = useState(true);
  const running =
    vision.status === "running" || vision.status === "initializing";

  return (
    <main>
      <DevelopmentNav activePage="m2" />
      <header className="lab-page-header">
        <div>
          <p className="eyebrow">Opera Hero · Milestone M2</p>
          <h1>Landmark laboratory</h1>
          <p className="lede">
            Validate pose and hand tracking independently from gesture scoring
            and gameplay.
          </p>
        </div>
        <div className="simulation-notice">
          <span aria-hidden="true" />
          <p>
            <strong>Increment 1 simulator</strong>
            No camera or MediaPipe model is active
          </p>
        </div>
      </header>

      <section className="landmark-workbench" aria-label="Landmark workbench">
        <div className="preview-column">
          <LandmarkPreview
            frame={vision.latestFrame}
            showHands={showHands}
            showPose={showPose}
          />
          <div className="landmark-toolbar" aria-label="Landmark overlay controls">
            <label>
              <input
                checked={showPose}
                onChange={(event) => setShowPose(event.target.checked)}
                type="checkbox"
              />
              Pose overlay
            </label>
            <label>
              <input
                checked={showHands}
                onChange={(event) => setShowHands(event.target.checked)}
                type="checkbox"
              />
              Hand overlays
            </label>
          </div>
          <p className="preview-caption">
            The animated fixture exercises the same application contracts that
            the MediaPipe worker will implement in Increment 2.
          </p>
        </div>

        <div className="control-column">
          <section className="lab-panel" aria-labelledby="simulation-title">
            <div className="lab-panel-heading">
              <div>
                <p className="check-kicker">Runtime control</p>
                <h2 id="simulation-title">Landmark simulator</h2>
              </div>
            </div>
            <p className="simulation-copy">
              Generates a deterministic 33-point pose and two 21-point hands.
              It never requests camera permission or loads machine-learning assets.
            </p>
            <div className="button-row lab-button-row">
              <button
                className="primary-button"
                disabled={running}
                onClick={() => void vision.start()}
                type="button"
              >
                Start simulation
              </button>
              <button
                className="secondary-button"
                disabled={!running}
                onClick={vision.stop}
                type="button"
              >
                Stop
              </button>
            </div>
          </section>

          <LandmarkDiagnostics
            capabilities={vision.capabilities}
            error={vision.error}
            frame={vision.latestFrame}
            processedFrames={vision.processedFrames}
            skippedFrames={vision.skippedFrames}
            status={vision.status}
          />
        </div>
      </section>

      <footer>
        Increment 1 proves the vision boundary with simulated data. Increment 2
        will add the pinned MediaPipe Pose Landmarker worker.
      </footer>
    </main>
  );
}
