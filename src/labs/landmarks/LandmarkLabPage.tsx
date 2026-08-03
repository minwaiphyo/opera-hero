import { useState } from "react";
import { DevelopmentNav } from "../../app/DevelopmentNav";
import {
  findReplayFixture,
  REPLAY_FIXTURES,
} from "../../vision/replay/replayFixtureCatalog";
import type { VisionReplayFixture } from "../../vision/replay/visionReplayTypes";
import {
  parseVisionReplayFixture,
  VisionReplayValidationError,
} from "../../vision/replay/visionReplayValidation";
import { LandmarkReplayCanvas } from "./LandmarkReplayCanvas";
import { useReplayLandmarkLab } from "./useReplayLandmarkLab";
import "./landmarkLab.css";

export function LandmarkLabPage() {
  const [fixture, setFixture] = useState(REPLAY_FIXTURES[0]!);
  const [fixtureRevision, setFixtureRevision] = useState(0);
  const [loadMessage, setLoadMessage] = useState("");

  function selectCatalogFixture(fixtureId: string) {
    setFixture(findReplayFixture(fixtureId));
    setFixtureRevision((revision) => revision + 1);
    setLoadMessage("");
  }

  async function loadLocalFixture(file?: File) {
    if (!file) return;
    try {
      const value: unknown = JSON.parse(await file.text());
      setFixture(parseVisionReplayFixture(value));
      setFixtureRevision((revision) => revision + 1);
      setLoadMessage(`Loaded ${file.name}.`);
    } catch (error) {
      const detail =
        error instanceof VisionReplayValidationError || error instanceof SyntaxError
          ? error.message
          : "The selected fixture could not be loaded.";
      setLoadMessage(`Fixture load failed: ${detail}`);
    }
  }

  return (
    <LandmarkLabWorkbench
      fixture={fixture}
      key={fixtureRevision}
      loadMessage={loadMessage}
      onFixtureChange={selectCatalogFixture}
      onLocalFixture={loadLocalFixture}
    />
  );
}

function LandmarkLabWorkbench({
  fixture,
  loadMessage,
  onFixtureChange,
  onLocalFixture,
}: {
  fixture: VisionReplayFixture;
  loadMessage: string;
  onFixtureChange: (fixtureId: string) => void;
  onLocalFixture: (file?: File) => void;
}) {
  const replay = useReplayLandmarkLab(fixture);
  const playing = replay.snapshot.status === "running";

  return (
    <main>
      <DevelopmentNav activePage="m2" />
      <header className="lab-page-header">
        <div>
          <p className="eyebrow">Opera Hero · Milestone M2</p>
          <h1>Landmark replay laboratory</h1>
          <p className="lede">
            Exercise normalized pose, hand, framing, and quality behavior without
            a camera or MediaPipe inference.
          </p>
        </div>
        <div className="lab-safety-note">
          <span aria-hidden="true" />
          <p>
            <strong>Landmarks only</strong>
            No recorded imagery
          </p>
        </div>
      </header>

      <section className="replay-workbench" aria-label="Landmark replay workbench">
        <div className="replay-preview">
          <LandmarkReplayCanvas frame={replay.frame} />
          <span className={`replay-status ${replay.snapshot.status}`}>
            Replay · {replay.snapshot.status}
          </span>
          <dl className="replay-quality">
            <Metric
              label="Presence"
              value={replay.assessment.presence ? "present" : "absent"}
            />
            <Metric label="Framing" value={replay.assessment.framing} />
            <Metric
              label="Quality"
              value={`${(replay.assessment.score * 100).toFixed(1)}% · ${replay.assessment.band}`}
            />
            <Metric
              label="Hands"
              value={`${replay.assessment.handsDetected}/2`}
            />
          </dl>
        </div>

        <section className="replay-controls" aria-labelledby="replay-controls-title">
          <p className="check-kicker">Deterministic source</p>
          <h2 id="replay-controls-title">Replay controls</h2>

          <label className="replay-local-loader">
            Load local fixture JSON
            <input
              accept="application/json,.json"
              onChange={(event) => onLocalFixture(event.target.files?.[0])}
              type="file"
            />
          </label>
          {loadMessage ? (
            <p aria-live="polite" className="replay-load-message">
              {loadMessage}
            </p>
          ) : null}

          <label htmlFor="replay-fixture">Fixture</label>
          <select
            id="replay-fixture"
            onChange={(event) => onFixtureChange(event.target.value)}
            value={isCatalogFixture(fixture.id) ? fixture.id : "local"}
          >
            {!isCatalogFixture(fixture.id) ? (
              <option value="local">Local · {fixture.id}</option>
            ) : null}
            {REPLAY_FIXTURES.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.id}
              </option>
            ))}
          </select>
          <p>{fixture.description}</p>

          <label htmlFor="replay-speed">Playback speed</label>
          <select
            id="replay-speed"
            onChange={(event) =>
              replay.setPlaybackRate(Number(event.target.value))
            }
            value={replay.snapshot.playbackRate}
          >
            {[0.25, 0.5, 1, 2, 4].map((rate) => (
              <option key={rate} value={rate}>
                {rate}×
              </option>
            ))}
          </select>

          <div className="replay-buttons">
            <button disabled={playing} onClick={replay.play} type="button">
              {replay.snapshot.status === "paused" ? "Resume" : "Play"}
            </button>
            <button disabled={!playing} onClick={replay.pause} type="button">
              Pause
            </button>
            <button onClick={replay.restart} type="button">
              Restart
            </button>
            <button onClick={replay.stop} type="button">
              Stop
            </button>
          </div>

          <dl className="replay-details">
            <Metric label="State" value={replay.snapshot.status} />
            <Metric
              label="Position"
              value={`${Math.round(replay.snapshot.positionMs)} / ${replay.snapshot.durationMs} ms`}
            />
            <Metric
              label="Frames emitted"
              value={String(replay.snapshot.emittedFrames)}
            />
            <Metric label="Source" value={fixture.source} />
            <Metric label="Frames" value={String(fixture.frames.length)} />
            {fixture.extraction ? (
              <>
                <Metric label="Source file" value={fixture.extraction.sourceFile} />
                <Metric
                  label="Source duration"
                  value={`${fixture.extraction.sourceDurationMs} ms`}
                />
                <Metric
                  label="Retained range"
                  value={`${fixture.extraction.trimmedStartMs}–${fixture.extraction.trimmedEndMs} ms`}
                />
                <Metric
                  label="Sample rate"
                  value={`${fixture.extraction.sampleFps} FPS`}
                />
                <Metric
                  label="Motion detected"
                  value={fixture.extraction.motionDetected ? "yes" : "no"}
                />
                <Metric
                  label="Edge padding"
                  value={`${fixture.extraction.edgePaddingMs} ms`}
                />
              </>
            ) : null}
          </dl>
        </section>
      </section>

      <footer>
        M2 replay mode drives the same normalized renderer and quality rules as
        live inference without requiring a camera.
      </footer>
    </main>
  );
}

function isCatalogFixture(fixtureId: string): boolean {
  return REPLAY_FIXTURES.some((fixture) => fixture.id === fixtureId);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
