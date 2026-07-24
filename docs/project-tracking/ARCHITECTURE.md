# Opera Hero — Exhibition System Design

## 1. Executive recommendation

Build Opera Hero as a **local-first, offline TypeScript web application** running in
a pinned Chromium/Edge kiosk on one exhibition computer:

```text
Camera
  │
  ▼
Browser media capture ──► Vision Web Worker ──► normalized landmark frames
  │                         │
  │                         ├─ MediaPipe Pose Landmarker
  │                         └─ MediaPipe Hand Landmarker
  │
  ▼
Gameplay state machine ◄── gesture evaluator ◄── temporal feature buffer
  │
  ├─ audiovisual scene renderer
  ├─ tutorial / feedback / cultural overlays
  ├─ audio and narration controller
  └─ local health events and bounded diagnostics
```

There should be no network dependency and, initially, no Python inference service.
Models, audio, images, fonts, story content, and application bundles are installed
locally. The browser communicates with the inference worker through structured
messages and transferable objects. A small operating-system-level launcher keeps the
kiosk alive and relaunches it after a crash.

This is not the fewest possible lines of code. It is the smallest architecture that
creates useful engineering boundaries:

- deterministic gameplay orchestration;
- a testable, replaceable vision adapter;
- content separate from engine code;
- graceful degradation and unattended recovery;
- offline packaging and reproducible builds;
- observable performance without recording visitors.

The hard engineering work should go into interaction quality, tuning, recovery, and
exhibition soak testing—not infrastructure that the installation does not need.

## 2. Quality priorities and explicit targets

Agree on measurable acceptance criteria before choosing hardware:

| Concern | Initial target |
|---|---|
| Startup | attract screen available within 15 seconds of OS login |
| Offline use | complete operation with Wi-Fi disabled |
| Vision latency | p95 capture-to-landmarks below 100 ms on target hardware |
| Visual frame rate | stable 50–60 FPS; inference may run independently at 15–30 FPS |
| Gesture experience | at least 90% completion by genuine first-time participants |
| Recovery | abandoned session returns to attract mode within 20–30 seconds |
| Crash recovery | kiosk relaunch within 15 seconds |
| Session length | roughly 2 minutes, with bounded timeouts at every interactive step |
| Privacy | no camera frames written to disk; no identifying telemetry |
| Endurance | 8–12 hour soak test with no manual intervention or unbounded memory growth |

These are budgets to validate on the final computer, camera, lighting, screen, and
physical visitor distance. They are not promises inferred from developer laptops.

## 3. Technology stack

### Core

- **TypeScript** in strict mode for the application and vision contracts.
- **React + Vite** for UI composition, fast asset builds, and a modest ecosystem.
- **XState** for the authoritative gameplay statechart.
- **MediaPipe Tasks Vision** for pose and hand landmarks.
- **Web Worker + OffscreenCanvas where supported** for vision work away from the UI
  thread.
- **HTML Canvas or PixiJS** for the camera treatment, particles, anchored costume
  elements, and composited feedback.
- **Web Audio API** for scheduled cues, volume ducking, and synchronized music and
  narration.
- **Vitest** for unit/component tests and **Playwright** for browser flow and recovery
  tests.
- **ESLint + Prettier**, a lockfile, and CI checks for reproducible quality.

React should render screens and accessible overlays, not update every landmark at
30 FPS through component state. The high-frequency path belongs in a worker and
canvas renderer; the state machine receives only semantic events such as
`TRACKING_READY`, `ATTEMPT_PROGRESS`, and `GESTURE_ACCEPTED`.

### What not to add

- No Next.js: server rendering and server routes add no value to an offline kiosk.
- No Redux plus XState: two authoritative stores create synchronization bugs.
- No backend database: bounded local diagnostics are enough.
- No WebSocket for worker communication: `postMessage` is the native in-process
  boundary.
- No Docker in the live camera path: container access to a desktop camera, audio, and
  kiosk UI makes installation less reliable. Containers may still be useful in CI.
- No Electron by default: Chromium kiosk mode already provides the needed runtime
  with a smaller maintenance surface. Reconsider Electron only if native device
  control, signed single-package distribution, or browser-policy limitations become
  concrete requirements.

## 4. Frontend architecture

Organize the application into four layers:

1. **Experience layer** — attract, welcome, calibration, story, tutorial, gesture,
   insight, completion, and recovery screens.
2. **Application layer** — statechart, timers, session policy, audio coordination,
   and semantic events.
3. **Domain layer** — gesture definitions, landmark features, scoring, story schema,
   and pure validation.
4. **Infrastructure layer** — camera, MediaPipe worker, audio assets, browser storage,
   clock, logging, and kiosk health adapters.

Dependencies point inward. Domain gesture evaluators do not import React, MediaPipe,
or browser APIs. A normalized `LandmarkFrame` contract prevents a model vendor's
types from leaking through the codebase.

Use a small state machine context for slow-changing session data:

```ts
type GameContext = {
  sessionId: string;
  currentBeat: number;
  completedGestures: string[];
  trackingQuality: "lost" | "poor" | "good";
  accessibility: { subtitles: boolean; reducedMotion: boolean };
};
```

Do not store video frames, landmarks, animation progress, or audio playback position
in React or XState context. Keep them in dedicated services.

### Asset and content strategy

Represent the level as versioned, validated content:

```text
story.json
  scenes[]
    narration asset and subtitle
    music cue
    visual layers
    optional tutorial
    gesture definition ID
    feedback variants
    cultural insight
    duration and timeout policy
```

Validate it at build time with Zod or JSON Schema. This lets a designer change copy,
timing, and assets without editing engine logic, while malformed content fails the
build rather than the exhibition.

Preload and decode the next scene's assets before entering it. Keep a manifest with
content hashes so a partial or stale deployment is detectable at startup. Use
locally bundled fonts and media only.

## 5. Gesture detection architecture

### Pipeline

```text
video frame
  → resize/crop to inference resolution
  → pose + hand landmark inference
  → confidence and visibility gate
  → normalize coordinates relative to shoulders/torso
  → derive features (angles, distances, velocities, symmetry)
  → smooth over a short rolling window
  → active gesture evaluator
  → progress / accepted / tracking-lost event
```

Capture at the camera's supported rate, render independently at display refresh rate,
and run inference at the rate the target hardware sustains. Apply backpressure:
there must be at most one queued inference frame. Drop an old frame rather than
building latency.

Use timestamps from capture throughout the pipeline. Instrument:

- capture-to-worker delay;
- model inference time;
- feature/scoring time;
- worker-to-feedback delay;
- dropped-frame ratio;
- landmark confidence and tracking-loss duration.

The application should never transfer or persist full camera frames after inference.

### Model recommendation

**Primary pose model: MediaPipe Pose Landmarker.** It supplies upper-body landmarks
and can optionally provide a segmentation mask. Its common model family is suitable
for real-time edge use, and using the same Tasks runtime as hands reduces integration
surface. Start with the lighter variant, then choose the final variant from measured
p95 latency and tracking stability on exhibition hardware.

**Primary hand model: MediaPipe Hand Landmarker**, not the canned Gesture Recognizer.
Opera poses are domain-specific; 21 hand landmarks plus handedness allow transparent
rules and custom scoring. In video/live-stream operation, MediaPipe tracks the hand
region between detections, reducing repeated palm-detection work
([official Hand Landmarker guide](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js)).

**Benchmark alternative: MoveNet SinglePose Lightning.** It is a reasonable fallback
if MediaPipe pose performance is unstable on the selected hardware. MoveNet exposes
17 body keypoints and its Lightning variant is intended for latency-sensitive use
([official TensorFlow.js model documentation](https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/src/movenet/README.md)).
Its smaller keypoint set makes it less attractive when wrist/elbow/shoulder geometry
and a unified MediaPipe runtime already cover the requirement.

Do not begin with a trained gesture classifier. With only two or three gestures,
interpretable landmark rules are easier to tune, explain, test, and deliberately make
lenient. Record opt-in, staged test clips only if rules later prove inadequate; then
add a small temporal classifier behind the same evaluator interface.

### Costume overlays

There is no need for a generative "costume model" in the live loop. Use:

- pose landmarks as attachment points;
- torso/shoulder geometry for translation, scale, and rotation;
- layered transparent 2D art, particles, and cloth-like secondary animation;
- optional pose segmentation to place some effects behind the visitor.

This produces a stylized theatrical transformation at predictable latency. It is
also culturally safer and more controllable than generating costume imagery live.
Have a Cantonese Opera practitioner or cultural advisor review pose names, costume
elements, colors, character-role symbolism, narration, and insight text.

If occlusion quality is insufficient, test MediaPipe's segmentation output first.
Only benchmark a separate segmentation model after profiling; running another model
can consume the latency budget needed for responsive gestures.

## 6. Browser inference versus a local inference server

### Recommendation: browser inference

For this scope and a single known machine, browser inference wins:

- camera frames remain inside one process boundary and never require encoding;
- no local API, port, CORS, process lifecycle, protocol version, or reconnect logic;
- offline operation is natural;
- JavaScript worker messaging is low overhead;
- MediaPipe's web Tasks API and model assets can be pinned with the application;
- one deployment artifact is easier to restore.

The browser compatibility matrix for ONNX Runtime Web also shows why a fixed Chromium
kiosk is valuable: WebGPU availability differs between browser/platform combinations,
while WASM is the broad fallback
([official compatibility table](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)).
MediaPipe should be the initial runtime; ONNX Runtime Web is a good future adapter for
a custom model, with WebGPU for heavier inference and WASM fallback
([official WebGPU guidance](https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html)).

### When a local server becomes justified

Introduce a supervised Python/ONNX Runtime service only if measurements show one of:

- the required model cannot run in the browser;
- a supported discrete GPU backend is materially faster and necessary;
- browser memory/runtime instability survives pinned-version testing;
- multiple displays must consume the same inference stream.

If that happens, keep capture close to inference. Prefer a native capture/inference
process sending only landmark results to the browser over repeatedly JPEG-encoding
frames across HTTP. Use a versioned localhost WebSocket protocol for continuous
results, a small health endpoint for readiness, bounded reconnect with jitter, and a
supervisor that restarts both processes. This is a fallback architecture, not work
to implement speculatively.

## 7. Gesture scoring

### Principles

Scoring is a progress detector, not an exam. Hide numerical scores from visitors.
Internally compute a continuous confidence so animation can respond immediately, but
map success to varied positive phrases.

Each gesture definition contains:

- prerequisite tracking confidence;
- spatial feature checks;
- optional motion feature checks;
- per-feature weights and broad tolerance bands;
- hold duration;
- attempt timeout;
- participation fallback policy.

Normalize distances by shoulder width or torso length so a visitor's body size and
camera distance do not change thresholds. Use joint angles and relative positions
instead of pixels. Mirror left/right gestures when the story permits.

Example for "raise one hand":

```text
hand above shoulder                 0.45
elbow lifted away from torso        0.20
arm has upward movement             0.15
hand landmarks visible / engaged    0.20
```

Convert each feature to a soft 0–1 membership score rather than a Boolean cliff.
Apply an exponential moving average or median window of roughly 200–400 ms. Accept
when the weighted score stays above a deliberately modest threshold for a short hold
(for example 400–700 ms). Add hysteresis so progress does not flicker near a boundary.
All values must be tuned empirically, not copied blindly from this proposal.

### Progressive success policy

Use three paths, all positive:

1. **Strong match** — immediate celebratory feedback.
2. **Genuine partial attempt** — accept after slightly longer sustained motion and
   use equally positive, non-ranked feedback.
3. **No detectable attempt by timeout** — play a gentle assisted flourish and
   continue the story. Do not expose that this was an automatic completion.

Tracking loss pauses judgment; it does not reset progress. Briefly show a diegetic
prompt such as "Step into the lantern light" with a simple silhouette. After a bounded
period, continue using the assisted path.

Unit-test every evaluator with synthetic landmark sequences:

- canonical pose;
- mirrored pose;
- smaller/larger body normalization;
- low-confidence hands;
- jitter around threshold;
- brief and sustained matches;
- tracking loss and recovery;
- unrelated motion;
- timeout participation fallback.

Then tune against a deliberately diverse opt-in test group: heights, skin tones,
clothing, mobility ranges, left/right handedness, and lighting conditions.

## 8. Component communication

Define a small discriminated-union protocol between UI and vision worker:

```ts
type VisionCommand =
  | { type: "INIT"; modelUrls: ModelManifest }
  | { type: "START"; gestureId: string }
  | { type: "SET_GESTURE"; gestureId: string }
  | { type: "STOP" };

type VisionEvent =
  | { type: "READY"; capabilities: Capabilities }
  | { type: "TRACKING"; quality: number; framing: FramingHint }
  | { type: "PROGRESS"; gestureId: string; value: number }
  | { type: "ACCEPTED"; gestureId: string; evidence: ScoreSummary }
  | { type: "METRIC"; name: string; value: number }
  | { type: "ERROR"; code: VisionErrorCode; recoverable: boolean };
```

Validate boundary messages in development and version the protocol. Rate-limit
`PROGRESS` events (for example, 10 Hz) even when inference runs faster. Never send
raw landmarks into React unless a hidden technician diagnostics view explicitly
needs them.

Use XState events for application coordination and Web Audio clocks for precise audio
timing. Do not try to synchronize narration using chains of `setTimeout`; enter a
scene, schedule its cues against one monotonic timeline, and cancel them as a group
when leaving.

## 9. Gameplay state management

Suggested statechart:

```text
boot
  ├─ loadingAssets
  ├─ requestingCamera
  ├─ degradedRecovery
  └─ attract
       └─ welcome
            └─ calibration
                 ├─ story.scene
                 │    ├─ narrating
                 │    ├─ demonstrating
                 │    ├─ countdown
                 │    ├─ attempting
                 │    │    ├─ tracking
                 │    │    └─ trackingLost
                 │    ├─ celebrating
                 │    └─ culturalInsight
                 └─ completion
                      └─ resetting → attract
```

Model timeouts as state transitions, not scattered callbacks. On state exit, cancel
camera subscriptions, timers, audio cues, and animation work owned by that state.
Use guarded transitions so stale worker events from the previous gesture cannot
complete the next one.

Treat each session as disposable. `RESET` stops audio, clears worker gesture buffers,
returns content to scene zero, releases temporary canvas resources, rotates the
diagnostic session ID, and returns to attract mode without reloading the page. Use a
full page reload periodically between sessions (for example after a configurable
number of sessions or after memory exceeds a tested limit) as a second line of
defense.

## 10. Exhibition recovery and error handling

### Visitor and tracking recovery

- Attract mode starts only after presence/motion is sustained, avoiding false starts.
- Welcome requires a large, obvious dwell or touch action; do not rely on a subtle
  gesture before calibration.
- Calibration uses a forgiving framing zone and advances after several stable frames.
- No-presence timeout during any scene returns to attract mode after an on-screen
  countdown.
- Gesture timeout continues positively through assisted completion.
- Short tracking loss pauses the attempt; long loss advances or resets according to
  scene policy.
- Audio always has subtitles; critical direction is both visual and audible.

### Technical recovery

- Pin the OS, browser, model, and dependency versions; disable surprise updates during
  exhibition hours.
- Configure camera permission in advance for the exact local origin.
- Start a local static server on loopback; avoid `file://` behavior and permission
  inconsistencies.
- Add an application heartbeat. A launcher detects a missing/unresponsive kiosk and
  restarts it.
- Use exponential backoff for camera reacquisition, then reload the application, then
  restart the browser as escalation steps.
- Show a culturally themed holding screen during recovery, never a stack trace.
- Catch global errors and unhandled rejections, record a sanitized diagnostic event,
  and trigger bounded recovery.
- Detect missing/corrupt assets during boot; fail into a technician screen with a
  short error code and recovery instructions.
- Add a keyboard-protected technician panel showing camera status, FPS, inference p50/
  p95, model versions, last sanitized errors, audio output, and a reset control.

Do not collect video or face images. Store only a bounded ring buffer of anonymous
operational events in IndexedDB, such as build version, timestamps, state transitions,
latencies, tracking quality buckets, automatic recoveries, and completion outcome.
Provide a deliberate technician export/clear action and document retention.

### Physical setup is part of the system

Software cannot compensate for an uncontrolled exhibition:

- mark a standing zone on the floor;
- use a fixed camera mount at an appropriate height and field of view;
- provide even front lighting and avoid bright backlighting;
- hide cables and lock down keyboard/ports where appropriate;
- use wired power and disable sleep, screen savers, notifications, and hot corners;
- test the actual costume-like clothing, background, and crowd movement expected;
- keep a labeled replacement camera/cable and a one-page recovery runbook.

## 11. Deployment architecture

```text
Exhibition PC
├─ pinned Chromium/Edge in kiosk mode
├─ Opera Hero static application on localhost
│  ├─ hashed JS/CSS bundles
│  ├─ local WASM and model files
│  ├─ local story/media/font assets
│  └─ build + content manifest
├─ minimal static-server process
├─ launcher/watchdog
└─ bounded local diagnostics
```

For a Windows exhibition PC, use a dedicated non-admin account and OS-supported
auto-login/startup configuration. Package a versioned release directory and a
scripted installer that:

1. verifies checksums and free disk space;
2. installs the new release beside the current one;
3. runs a local health/smoke check;
4. switches a small "current release" pointer;
5. retains the previous known-good release for rollback.

The launcher and static server can be a tiny, well-tested executable or a managed
service. Do not make npm development tooling part of the runtime startup path.

CI should produce the immutable release bundle, run type checking, unit tests,
content-schema validation, asset existence checks, a Playwright happy-path flow, and
a checksum manifest. A release is promoted only after target-device performance,
camera-permission, audio, reboot, network-disconnected, abandonment, and soak tests.

Maintain two deployment profiles:

- **exhibition**: locked content, diagnostics hidden, no dev tools, local-only;
- **technician**: diagnostics, landmark overlay, gesture thresholds, and replayable
  prerecorded test inputs.

## 12. Suggested repository structure

```text
opera-hero/
├─ apps/
│  └─ kiosk/
│     ├─ src/
│     │  ├─ app/                 # bootstrap, providers, routing
│     │  ├─ experience/          # screens and scene composition
│     │  ├─ gameplay/            # XState machine and session policies
│     │  ├─ vision/
│     │  │  ├─ worker/           # inference worker entry point
│     │  │  ├─ adapters/         # MediaPipe; future ONNX/replay adapters
│     │  │  ├─ features/         # normalized geometric features
│     │  │  ├─ gestures/         # pure temporal evaluators
│     │  │  └─ protocol.ts
│     │  ├─ rendering/           # canvas/Pixi composition and effects
│     │  ├─ audio/               # cue scheduler, narration, music
│     │  ├─ content/             # loaders and schema
│     │  ├─ platform/            # camera, storage, health, clock
│     │  └─ diagnostics/
│     ├─ public/
│     │  ├─ models/
│     │  ├─ stories/level-one/
│     │  ├─ audio/
│     │  ├─ art/
│     │  └─ fonts/
│     └─ tests/
│        ├─ fixtures/            # consented/synthetic landmark sequences
│        ├─ unit/
│        └─ e2e/
├─ packages/
│  ├─ contracts/                 # content and worker message schemas
│  └─ test-landmarks/            # synthetic sequences and replay helpers
├─ ops/
│  ├─ windows/                   # installer, launcher, watchdog configuration
│  ├─ runbook.md
│  └─ release-checklist.md
├─ docs/
│  ├─ project-tracking/          # architecture, roadmap, status, and evidence
│  ├─ adr/                       # architecture decision records
│  ├─ privacy.md
│  └─ cultural-review.md
├─ .github/workflows/
└─ README.md
```

A monorepo workspace is acceptable here because it shares contracts and fixtures
without deploying separate services. Do not split packages until a real boundary
exists.

## 13. Extensibility

Useful extension points, without building them all now:

- `VisionAdapter`: MediaPipe today, recorded-landmark replay for tests, ONNX or native
  inference later.
- `GestureEvaluator`: declarative rule evaluators now, temporal classifier later.
- versioned `StoryDefinition`: additional stories/characters without changing the
  engine.
- `Renderer`: high/low effects profiles selected by capability benchmark.
- `TelemetrySink`: IndexedDB now, explicit export or opt-in remote reporting later.
- localization-ready copy and subtitles from day one.
- input abstraction for camera, touchscreen, and technician controls.

Record key choices as short ADRs: browser inference, statechart ownership, no
production database, privacy/telemetry boundaries, renderer choice, and deployment
supervision. Recruiters learn more from measured decisions and trade-offs than from a
long tool list.

## 14. What demonstrates strong software engineering

The strongest resume story is:

- a measured real-time pipeline with backpressure and latency budgets;
- explicit state-machine orchestration of a failure-prone physical experience;
- domain-specific, interpretable temporal gesture scoring;
- privacy-preserving edge inference;
- adapters and contracts around third-party ML;
- automated synthetic/replay tests plus real target-hardware validation;
- immutable offline releases, health checks, watchdog recovery, and rollback;
- evidence from public exhibition operation and soak-test metrics;
- responsible cultural review and inclusive user testing.

TypeScript, React, XState, Web Workers, MediaPipe, Canvas/Web Audio, Playwright, and CI
are practical technologies. Their value comes from how the boundaries are designed
and verified. Adding Kubernetes, Kafka, microservices, or cloud inference would make
this particular system less credible, not more impressive.

## 15. One-month delivery plan

### Week 1 — vertical slice and hardware baseline

- Lock target PC, camera, display, lighting assumptions, and Chromium version.
- Implement camera capture, pose/hands worker, diagnostics overlay, and latency
  instrumentation.
- Define one gesture evaluator and synthetic fixtures.
- Build an ugly but complete statechart from attract through auto-reset.
- Decide the rendering technology after a small Canvas/Pixi benchmark.

**Exit criterion:** one unpolished gesture completes offline on target hardware with
measured p95 latency inside budget.

### Week 2 — complete gameplay

- Add all two or three gestures and replayable test sequences.
- Integrate narration, music, subtitles, tutorials, cultural overlays, and content
  schema.
- Add progressive success, tracking-loss handling, abandonment, and assisted
  completion.
- Conduct the first cultural and accessibility review.

**Exit criterion:** the full two-minute level is completable without developer tools.

### Week 3 — visual polish and kiosk hardening

- Add costume/effect composition, transitions, cue scheduling, and asset preloading.
- Implement launcher, heartbeat, recovery screen, diagnostics ring buffer, release
  packaging, rollback, and technician view.
- Run diverse participant tests and tune thresholds from evidence.

**Exit criterion:** reboot-to-attract works offline; all known failure drills recover.

### Week 4 — freeze and prove reliability

- Content freeze early in the week.
- Full-device 8–12 hour soak tests and repeated session loops.
- Test camera unplug/replug, browser kill, refresh, no visitor, walk-away, poor
  framing, missing audio device, corrupt asset, and power restart.
- Fix only severity-one issues after release candidate freeze.
- Produce spare media, checksums, an operator runbook, and a known-good rollback.

**Exit criterion:** signed-off release candidate survives exhibition-length operation
and the recovery runbook is executable by someone other than the developer.

## 16. Decision summary

| Question | Recommendation |
|---|---|
| Overall architecture | offline modular monolith in a supervised Chromium kiosk |
| Frontend | strict TypeScript, React/Vite, canvas renderer, Web Audio |
| Gameplay state | one explicit XState statechart |
| Inference location | browser Web Worker |
| Pose | MediaPipe Pose Landmarker; benchmark MoveNet Lightning as fallback |
| Hands | MediaPipe Hand Landmarker and custom domain rules |
| Costume | landmark-anchored authored 2D art; optional pose segmentation |
| Scoring | normalized soft features + smoothing + hold + assisted completion |
| Communication | worker `postMessage`; semantic events only |
| Runtime data | bounded anonymous IndexedDB diagnostics; never camera footage |
| Deployment | immutable local bundle, static server, kiosk, watchdog, rollback |
| Containerization | CI/build only if useful; not the live exhibition path |
| Future ML | adapter-backed ONNX/custom temporal model only after evidence |

The proposal deliberately spends complexity on the parts the public installation
will actually stress: perception, timing, audiovisual continuity, recovery, content
integrity, and unattended operation.
