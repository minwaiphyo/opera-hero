import { useState } from "react";
import { DevelopmentNav } from "../../app/DevelopmentNav";
import {
  findReplayFixture,
  REPLAY_FIXTURES,
} from "../../vision/replay/replayFixtureCatalog";
import type { VisionReplayFixture } from "../../vision/replay/visionReplayTypes";
import { LandmarkReplayCanvas } from "./LandmarkReplayCanvas";
import { useReplayLandmarkLab } from "./useReplayLandmarkLab";
import "./landmarkLab.css";

export function LandmarkLabPage() {
  const [fixtureId, setFixtureId] = useState(REPLAY_FIXTURES[0]!.id);
  const fixture = findReplayFixture(fixtureId);

  return (
    <LandmarkLabWorkbench
      fixture={fixture}
      key={fixture.id}
      onFixtureChange={setFixtureId}
    />
  );
}

function LandmarkLabWorkbench({
  fixture,
  onFixtureChange,
}: {
  fixture: VisionReplayFixture;
  onFixtureChange: (fixtureId: string) => void;
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

          <label htmlFor="replay-fixture">Fixture</label>
          <select
            id="replay-fixture"
            onChange={(event) => onFixtureChange(event.target.value)}
            value={fixture.id}
          >
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
