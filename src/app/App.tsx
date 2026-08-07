import { useMemo } from "react";
import {
  collectBrowserBaseline,
  requiredCapabilitiesPass,
} from "../platform/capabilities";
import { CameraLabPage } from "../labs/camera/CameraLabPage";
import { LandmarkLabPage } from "../labs/landmarks/LandmarkLabPage";
import { GamePage } from "../gameplay/GamePage";
import { DevelopmentNav } from "./DevelopmentNav";
import { HardwareChecks } from "./HardwareChecks";
import { resolveAppRoute } from "./routes";

const provisionalProfile = [
  ["Computer", "Lenovo Legion Slim 7 16IRH8"],
  ["Operating system", "Windows 11 Home, x64"],
  ["Processor", "Intel Core i7-13700H"],
  ["Memory", "16 GB RAM"],
  ["Graphics", "Intel UHD + NVIDIA RTX 4050 Laptop GPU"],
  ["Camera", "SunplusIT integrated camera"],
  ["Primary display", "1600 × 1000, landscape"],
  ["Browser", "Google Chrome 150 (provisional pin)"],
  ["Visitor zone", "1–2 metres"],
  ["Session trigger", "Visitor presses Start"],
] as const;

export function App() {
  const route = resolveAppRoute(window.location.pathname);

  if (route === "camera-lab") {
    return <CameraLabPage />;
  }
  if (route === "landmark-lab") {
    return <LandmarkLabPage />;
  }
  if (route === "game") {
    return <GamePage />;
  }

  return <BaselinePage />;
}

function BaselinePage() {
  const baseline = useMemo(() => collectBrowserBaseline(), []);
  const ready = requiredCapabilitiesPass(baseline);

  return (
    <main>
      <DevelopmentNav activePage="m0" />
      <header className="hero">
        <div>
          <p className="eyebrow">Opera Hero · Milestone M0</p>
          <h1>System baseline</h1>
          <p className="lede">
            A local capability check for the provisional exhibition computer.
            No camera frames are captured or stored on this screen.
          </p>
        </div>
        <div className={`readiness ${ready ? "ready" : "blocked"}`}>
          <span className="readiness-dot" aria-hidden="true" />
          <div>
            <strong>{ready ? "Core browser checks passed" : "Action required"}</strong>
            <span>
              {ready
                ? "Ready to begin the camera laboratory"
                : "One or more required browser APIs are unavailable"}
            </span>
          </div>
        </div>
      </header>

      <section aria-labelledby="profile-title">
        <div className="section-heading">
          <div>
            <p className="section-number">01</p>
            <h2 id="profile-title">Provisional exhibition profile</h2>
          </div>
          <span className="tag">Target A · Laptop</span>
        </div>
        <dl className="profile-grid">
          {provisionalProfile.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="capability-title">
        <div className="section-heading">
          <div>
            <p className="section-number">02</p>
            <h2 id="capability-title">Live browser capabilities</h2>
          </div>
          <span className="tag">{baseline.viewport.orientation}</span>
        </div>
        <div className="capability-grid">
          {baseline.capabilities.map((capability) => (
            <article className="capability-card" key={capability.id}>
              <div className="capability-title">
                <h3>{capability.label}</h3>
                <span className={`status ${capability.state}`}>
                  {capability.state}
                </span>
              </div>
              <p>{capability.detail}</p>
              <small>{capability.required ? "Required" : "Optional"}</small>
            </article>
          ))}
        </div>
      </section>

      <HardwareChecks />

      <section className="technical" aria-labelledby="runtime-title">
        <div>
          <p className="section-number">04</p>
          <h2 id="runtime-title">Runtime snapshot</h2>
        </div>
        <dl>
          <div>
            <dt>Viewport</dt>
            <dd>
              {baseline.viewport.width} × {baseline.viewport.height}
            </dd>
          </div>
          <div>
            <dt>Pixel ratio</dt>
            <dd>{baseline.viewport.pixelRatio}</dd>
          </div>
          <div>
            <dt>Network</dt>
            <dd>{baseline.online ? "Connected" : "Offline"}</dd>
          </div>
          <div>
            <dt>Build</dt>
            <dd>{__BUILD_TIME__}</dd>
          </div>
        </dl>
        <p className="user-agent">{baseline.userAgent}</p>
      </section>

      <footer>
        M0 validates the platform only. Camera permission and video lifecycle are
        tested separately in M1.
      </footer>
    </main>
  );
}
