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
            The tested camera lifecycle service now exists behind this page.
            Live preview controls arrive after device discovery is implemented.
          </p>
        </div>
        <div className="readiness">
          <span className="readiness-dot pending" aria-hidden="true" />
          <div>
            <strong>Increment 2 implemented</strong>
            <span>The service is intentionally not connected to this page yet</span>
          </div>
        </div>
      </header>

      <section aria-labelledby="m1-boundary-title">
        <div className="section-heading">
          <div>
            <p className="section-number">Current boundary</p>
            <h2 id="m1-boundary-title">What exists after this increment</h2>
          </div>
          <span className="tag">Headless service</span>
        </div>
        <div className="placeholder-grid">
          <article>
            <h3>Single-stream ownership</h3>
            <p>
              Repeated starts share one request, while stop, restart, and
              disposal release every track deterministically.
            </p>
          </article>
          <article>
            <h3>Concurrency safety</h3>
            <p>
              A late camera request cannot reactivate the camera after a stop,
              restart, or session reset.
            </p>
          </article>
          <article>
            <h3>Interruption reporting</h3>
            <p>
              Ended tracks transition to an interrupted state and publish a
              safe device-disconnected event.
            </p>
          </article>
        </div>
      </section>

      <footer>
        Device discovery and USB-camera selection follow in Increment 3. The
        live laboratory interface follows in Increment 4.
      </footer>
    </main>
  );
}
