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
            Camera discovery, preferred-device storage, and deterministic
            fallback behavior now exist behind this page. Live controls arrive
            in the next increment.
          </p>
        </div>
        <div className="readiness">
          <span className="readiness-dot pending" aria-hidden="true" />
          <div>
            <strong>Increment 3 implemented</strong>
            <span>Device selection UI arrives in Increment 4</span>
          </div>
        </div>
      </header>

      <section aria-labelledby="m1-boundary-title">
        <div className="section-heading">
          <div>
            <p className="section-number">Current boundary</p>
            <h2 id="m1-boundary-title">What exists after this increment</h2>
          </div>
          <span className="tag">Device-ready service</span>
        </div>
        <div className="placeholder-grid">
          <article>
            <h3>Camera discovery</h3>
            <p>
              Video inputs are separated from microphones and receive stable
              fallback labels when permission hides their names.
            </p>
          </article>
          <article>
            <h3>Explicit preference</h3>
            <p>
              A technician-selected camera is stored locally using a versioned,
              validated preference with no visitor data.
            </p>
          </article>
          <article>
            <h3>Safe fallback</h3>
            <p>
              If a saved camera disappears, the first available camera is
              selected and the stale preference is removed.
            </p>
          </article>
        </div>
      </section>

      <footer>
        The live laboratory interface, preview, controls, and camera selector
        follow in Increment 4.
      </footer>
    </main>
  );
}
