import { DevelopmentNav } from "../../app/DevelopmentNav";

export function CameraLabPlaceholder() {
  return (
    <main>
      <DevelopmentNav activePage="m1" />
      <header className="hero lab-placeholder-hero">
        <div>
          <p className="eyebrow">Opera Hero · Milestone M1</p>
          <h1>Camera laboratory</h1>
          <p className="lede">
            The camera contracts and error model are being established first.
            Live stream lifecycle controls arrive in the next increments.
          </p>
        </div>
        <div className="readiness">
          <span className="readiness-dot pending" aria-hidden="true" />
          <div>
            <strong>Increment 1 implemented</strong>
            <span>No live camera is activated on this page yet</span>
          </div>
        </div>
      </header>

      <section aria-labelledby="m1-boundary-title">
        <div className="section-heading">
          <div>
            <p className="section-number">Current boundary</p>
            <h2 id="m1-boundary-title">What exists after this increment</h2>
          </div>
          <span className="tag">Pure domain logic</span>
        </div>
        <div className="placeholder-grid">
          <article>
            <h3>Lifecycle vocabulary</h3>
            <p>
              Typed states, sessions, settings, events, stop reasons, and
              application-safe failures.
            </p>
          </article>
          <article>
            <h3>Error normalization</h3>
            <p>
              Browser-specific camera exceptions become stable, testable error
              codes with controlled messages.
            </p>
          </article>
          <article>
            <h3>Capture request</h3>
            <p>
              A validated 720p/30 FPS request that explicitly excludes
              microphone access.
            </p>
          </article>
        </div>
      </section>

      <footer>
        Live camera ownership begins in Increment 2. Device discovery and
        USB-camera selection follow in Increment 3.
      </footer>
    </main>
  );
}
