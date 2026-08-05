# Opera Hero — Incremental Delivery Roadmap

## 1. How we will build

Opera Hero should be developed as a sequence of independently testable vertical
slices. We will not build all screens first and connect the camera at the end. Each
milestone must produce something runnable, measurable, and safe to keep before the
next milestone starts.

The governing rule is:

> A milestone is complete only when its exit checks pass on the intended exhibition
> computer. “The code exists” is not an exit check.

Every milestone follows the same loop:

1. Define a small contract and measurable acceptance criteria.
2. Implement the simplest production-shaped version behind that contract.
3. Add a standalone harness or fixture so it can be tested without the whole game.
4. Test normal behavior, failure behavior, and cleanup.
5. Measure on the target hardware.
6. Record the result and known limitations.
7. Integrate it into one thin end-to-end path.

## 2. Module map

```text
                    ┌──────────────────────┐
                    │  Story content data  │
                    └──────────┬───────────┘
                               │
                               ▼
┌──────────┐    ┌──────────────────────────┐    ┌───────────────────┐
│ Camera   ├───►│ Vision + gesture engine  ├───►│ Gameplay machine  │
└──────────┘    └──────────────────────────┘    └─────────┬─────────┘
                                                        │
                         ┌──────────────────────────────┼──────────────┐
                         ▼                              ▼              ▼
                  ┌─────────────┐                ┌───────────┐  ┌────────────┐
                  │ UI/rendering│                │   Audio   │  │Diagnostics │
                  └─────────────┘                └───────────┘  └────────────┘
                         │                              │              │
                         └──────────────────────────────┴──────────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │ Kiosk + recovery │
                                              └──────────────────┘
```

The arrows are contracts, not direct access to internal state:

- Camera produces timestamped frames.
- Vision produces normalized landmarks and tracking quality.
- Gesture evaluators produce progress and accepted events.
- The gameplay machine produces scene commands.
- Render and audio services consume scene commands.
- Diagnostics observe sanitized events without controlling gameplay.

## 3. Environments

Maintain three modes from the beginning:

| Mode | Purpose | Camera required? |
|---|---|---|
| `development` | normal coding with diagnostics and fast refresh | optional |
| `replay` | deterministic tests using recorded/synthetic landmarks | no |
| `exhibition` | locked fullscreen experience with local assets only | yes |

Replay mode is essential. It lets us develop gameplay, scoring, and regression tests
without standing in front of the camera for every change.

## 4. Milestone 0 — decisions and baseline

### Goal

Remove environmental uncertainty before gameplay code exists.

### Inputs needed

- Intended exhibition PC or the closest available equivalent
- Camera model
- Screen resolution and orientation
- Browser choice and version
- Expected visitor distance and rough camera placement
- Whether interaction starts through touch, a physical button, or camera presence

Cultural content is not required yet. Placeholder gestures and artwork are enough.

### Build

- Initialize the TypeScript/Vite project with strict type checking.
- Add formatting, linting, unit tests, and Playwright smoke tests.
- Add environment configuration and a build/version identifier.
- Create a plain diagnostics page that reports:
  - browser and operating-system capabilities;
  - viewport and device pixel ratio;
  - camera enumeration and permission state;
  - WebAssembly, WebGL/WebGPU, Worker, and OffscreenCanvas availability;
  - audio playback capability.
- Add an architecture decision record template.

### Tests

- Clean checkout installs and builds using the lockfile.
- CI runs type checking, linting, unit tests, and one browser smoke test.
- Application loads with the network disabled after installation.
- Capability report runs on the target PC.

### Exit gate

- Target browser, resolution, camera, and runtime are documented.
- Camera and audio permissions survive a browser restart.
- A reproducible build artifact is produced.
- Any unsupported browser capabilities have an explicit fallback.

### Deliverable

A blank but trustworthy application shell and a hardware capability report.

## 5. Milestone 1 — camera laboratory

### Goal

Prove that camera acquisition, framing, and cleanup are reliable before adding ML.

### Module contract

```ts
interface CameraService {
  start(config: CameraConfig): Promise<CameraStream>;
  stop(): Promise<void>;
  getStatus(): CameraStatus;
  subscribe(listener: (event: CameraEvent) => void): Unsubscribe;
}
```

### Build

- Create a standalone `/lab/camera` screen.
- Start and stop the selected camera.
- Show mirrored preview, actual resolution, frame rate, and aspect ratio.
- Add a framing guide for head, shoulders, arms, and hands.
- Detect track-ended, permission-denied, camera-busy, and device-removed states.
- Add bounded retry and a clear recovery action.
- Ensure only one stream owns the camera.

### Tests

- Unit-test error mapping and retry policy with a fake media-device adapter.
- Start/stop the camera 50 times and check that tracks close.
- Navigate away and confirm that the camera light turns off.
- Refresh, deny permission, grant permission, unplug/reconnect the camera, and switch
  devices.
- Run for one hour and check memory and frame stability.

### Exit gate

- No leaked media tracks after repeated start/stop cycles.
- Camera removal produces a controlled state, not a blank or frozen screen.
- Stable preview is achieved at a documented resolution and frame rate.
- The physical standing/framing zone is known.

### Deliverable

A camera diagnostic laboratory that remains useful throughout development and at
installation time.

## 6. Milestone 2 — landmark laboratory

### Goal

Prove pose and hand tracking performance independently from scoring and gameplay.

### Module contract

```ts
type LandmarkFrame = {
  timestampMs: number;
  pose?: NormalizedPose;
  hands: NormalizedHand[];
  trackingQuality: number;
  framing: "absent" | "too-close" | "too-far" | "good";
};

interface VisionAdapter {
  initialize(): Promise<VisionCapabilities>;
  process(frame: VideoFrame): Promise<LandmarkFrame>;
  dispose(): Promise<void>;
}
```

### Build

- Put MediaPipe model execution in a Web Worker.
- Create `/lab/landmarks` with optional skeleton and confidence overlays.
- Implement one-frame backpressure: never queue stale camera frames.
- Normalize model-specific output into the application contract.
- Report inference duration, capture-to-result latency, dropped-frame rate, and
  tracking quality.
- Include model and runtime versions in diagnostics.
- Add a fake/replay vision adapter implementing the same interface.

### Tests

- Unit-test landmark normalization and framing classification.
- Feed synthetic model output through the adapter.
- Verify that slow inference drops frames instead of accumulating delay.
- Move in and out of frame, cross hands, turn sideways, and vary camera distance.
- Test different sleeves, skin tones, background clutter, and expected lighting.
- Run at least one hour while watching memory and p50/p95 latency.

### Exit gate

- Pose and both hands are sufficiently stable in the intended interaction zone.
- p95 capture-to-landmark latency is below the agreed target.
- Rendering remains responsive while inference runs.
- No unbounded queue or memory growth occurs.
- Replay mode can drive the system without a camera.

### Deliverable

A measured, replaceable landmark pipeline—still with no game logic.

## 7. Milestone 3 — gesture scoring laboratory

### Goal

Build transparent, replay-testable scoring for the three stakeholder-selected
festival gestures and prove each one in the live camera laboratory.

### Module contract

```ts
type GestureResult = {
  progress: number;
  trackingSufficient: boolean;
  accepted: boolean;
  evidence: Record<string, number>;
};

interface GestureEvaluator {
  reset(): void;
  update(frame: LandmarkFrame): GestureResult;
}
```

### Build

- Extract normalized pose and hand landmarks from approved practitioner recordings.
- Build interpretable features, multi-take reference envelopes where available,
  dynamic time warping, tracking coverage, and movement completeness.
- Keep gesture-specific tolerances and evidence visible in developer laboratories.
- Store compact landmarks and features rather than visitor images or video.
- Create deterministic success, partial, stationary, jitter, tracking-loss, and
  incorrect-movement regressions.
- Integrate all three gestures with worker-owned live inference, reference playback,
  bounded capture, and clean reset between attempts.

### Tests

- Evaluator unit tests contain no browser, MediaPipe, or React dependency.
- Normalization limits sensitivity to body size, camera distance, and translation.
- Dynamic time warping tolerates slower sincere performances.
- Stationary and reduced-range attempts cannot pass through positional resemblance.
- Missing optional hand evidence remains distinct from incorrect movement.
- Capture tests cover countdown, first-cycle protection, jitter, bounded timeout,
  cancellation, and session reset.
- Browser smoke tests retain the camera and replay laboratory entry points.

### Exit gate

- All three festival gestures have practitioner-derived, image-free references.
- Each evaluator distinguishes a sincere project-owner attempt from a stationary
  attempt on target hardware, without requiring precise frame timing.
- Live capture cannot finish before one complete reference cycle and always has a
  bounded manual or automatic exit.
- Every scoring change is regression-testable through deterministic landmark data.
- Formal participant calibration is explicitly deferred; M3 produces provisional
  soft similarity, not a claimed population-validated pass threshold.

### Deliverable

Three transparent gesture evaluators, a reusable scoring/capture framework, and a
live developer laboratory ready to feed the gameplay state machine.

### Cultural decision point

The three gestures and demonstration references are confirmed. Cultural narration,
permissible mirroring, and final insight text remain content approvals for later
gameplay milestones and do not alter the M3 scoring evidence.

## 8. Milestone 4 — gameplay state-machine simulator

### Goal

Prove the complete experience flow without depending on camera, final art, or final
audio.

### Module contract

The state machine receives semantic events:

```ts
type GameEvent =
  | { type: "VISITOR_READY" }
  | { type: "CALIBRATION_READY" }
  | { type: "GESTURE_PROGRESS"; value: number }
  | { type: "GESTURE_ACCEPTED" }
  | { type: "TRACKING_LOST" }
  | { type: "TRACKING_RECOVERED" }
  | { type: "NO_VISITOR" }
  | { type: "RESET" };
```

It never receives video frames or MediaPipe objects.

### Build

- Implement attract, welcome, calibration, narration, demonstration, countdown,
  attempt, celebration, cultural insight, completion, and reset states.
- Use placeholder screens and text.
- Model every delay and timeout as a state transition.
- Add a `/lab/gameplay` control panel that injects all possible events manually.
- Add replay-speed controls so a two-minute flow can be tested quickly.
- Ensure leaving a state cancels its timers, audio commands, and subscriptions.

### Tests

- Model tests cover every legal state transition.
- Stale events from a previous gesture cannot complete the next gesture.
- Tracking loss and recovery work in every attempt.
- No-attempt timeout advances positively.
- Visitor abandonment returns to attract mode.
- Reset from every major state produces the same clean initial context.
- Run hundreds of accelerated synthetic sessions.

### Exit gate

- Every state and recovery branch is reachable in the simulator.
- No path deadlocks or requires page refresh.
- A session always reaches completion or bounded reset.
- Repeated accelerated sessions do not accumulate timers or listeners.

### Deliverable

A deterministic two-minute game using buttons/replay data instead of live vision.

## 9. Milestone 5 — first vertical slice

### Goal

Connect the real camera, one real gesture, the state machine, and minimal feedback.

### Build

- Welcome and calibration
- One short narration beat
- One placeholder gesture demonstration
- Countdown
- Live progress and positive completion feedback
- One placeholder cultural insight
- Completion and automatic reset

Use basic shapes, temporary copy, and temporary audio. This milestone tests integration,
not visual polish.

### Tests

- Complete the slice using live camera input.
- Complete it using deterministic landmark replay.
- Walk away during calibration, narration, countdown, and attempt.
- Lose tracking temporarily.
- Make no gesture.
- Refresh in every major state.
- Run 50 repeated sessions.

### Exit gate

- A first-time participant completes the slice without developer assistance.
- No failure branch traps the visitor.
- Live and replay modes produce equivalent semantic events.
- Camera, worker, state machine, and UI clean up correctly after reset.

### Deliverable

The first honest proof that the architecture works end to end.

## 10. Milestone 6 — content pipeline

### Goal

Make story content replaceable without changing engine code.

### Build

- Define a versioned story schema.
- Add build-time validation for:
  - required scenes and transitions;
  - unique IDs;
  - known gesture evaluator IDs;
  - asset existence;
  - subtitle/narration pairing;
  - duration and timeout bounds;
  - cultural-insight length.
- Build an asset manifest with checksums.
- Add development previews for individual scenes.
- Add a placeholder story fixture used by automated tests.

### Information needed

- Approved story and character
- Final or draft script
- Gesture order and meaning
- Language/subtitle requirements
- Visual and audio references
- Rights/permission status for supplied assets

### Tests

- Valid story loads.
- Missing asset, duplicate scene, unknown gesture, and invalid duration fail the
  build with actionable messages.
- All scenes can be opened independently in preview mode.
- Application boots with the network disabled.

### Exit gate

- The placeholder story can be replaced by editing content and assets only.
- Invalid content cannot reach an exhibition build.
- All content is locally bundled and attributable.

### Deliverable

A validated content package separate from the game engine.

## 11. Milestone 7 — all gestures

### Goal

Implement and tune the final culturally approved gestures.

### Build

- Translate each reference gesture into observable pose/hand features.
- Decide which features are essential and which are merely expressive.
- Add evaluator fixtures and technician visualization.
- Add participation fallback for every gesture.
- Integrate gestures through IDs in story content.

### Tests

- Review each gesture interpretation with a Cantonese Opera advisor.
- Test with participants unfamiliar with Cantonese Opera.
- Include height, handedness, clothing, movement range, and lighting variation.
- Measure:
  - time to first successful attempt;
  - genuine-attempt completion rate;
  - accidental activation rate;
  - tracking-loss rate;
  - assisted-completion rate.

### Exit gate

- Cultural advisor approves meaning and demonstration.
- Genuine-attempt completion meets the agreed target.
- No participant receives negative or failure language.
- Thresholds and fixtures are versioned and reproducible.

### Deliverable

The full playable mechanic, still before expensive visual polish.

## 12. Milestone 8 — audio and visual experience

### Goal

Add immersion without destabilizing gameplay timing.

### Build

- Central audio cue scheduler using a monotonic Web Audio timeline.
- Narration, music, sound effects, subtitles, and volume ducking.
- Authored 2D face/costume overlays anchored to landmarks.
- Scene transitions, celebration effects, tutorial animation, and insight overlays.
- Preloading and decoding of the next scene's assets.
- High- and low-effects rendering profiles.

### Information needed

- Approved costume and makeup references
- Final artwork or approval to create commissioned/generated draft assets
- Narration recordings and pronunciation review
- Music/sound licensing
- Brand colors, logo, type, and exhibition screen specifications

### Tests

- Audio stays synchronized through normal play, tracking pauses, and reset.
- Missing audio produces subtitles and continued gameplay.
- Overlay does not obscure instructions or culturally important details.
- Rendering plus inference remains inside the latency/frame budget.
- Reduced-effects mode preserves gameplay on weaker hardware.
- Test rapid resets during every audio/animation cue.

### Exit gate

- Immersion features do not regress gesture latency or recovery.
- All assets are approved and licensed for public display.
- The experience is understandable with audio muted.
- All cues stop cleanly on abandonment/reset.

### Deliverable

A content-complete exhibition experience.

## 13. Milestone 9 — kiosk hardening

### Goal

Turn the playable experience into an unattended installation.

### Build

- Local static-server release bundle.
- Pinned browser kiosk launch.
- Dedicated non-admin exhibition account.
- Application heartbeat and process watchdog.
- Camera reacquisition and controlled page reload escalation.
- Sanitized, bounded local diagnostics.
- Hidden technician screen.
- Versioned installer, checksum verification, and known-good rollback.
- Startup, shutdown, and recovery runbook.

### Failure drills

- Network disconnected
- Browser process killed
- Static server killed
- Camera unplugged and reconnected
- Camera unavailable at boot
- Audio device missing
- Corrupt or missing asset
- Page refreshed mid-session
- Visitor walks away at every phase
- No gesture attempted
- Tracking lost for short and long periods
- Power cycle and OS restart
- Disk nearly full

### Exit gate

- Reboot reaches attract mode without developer action.
- Every failure drill has a bounded recovery or clear technician code.
- Previous known-good release can be restored quickly.
- No camera frames or identifying data are persisted.

### Deliverable

An installable, recoverable kiosk build.

## 14. Milestone 10 — exhibition validation and freeze

### Goal

Prove the system, stop changing it, and prepare for public operation.

### Validation

- Conduct moderated usability tests, followed by unattended observation.
- Run repeated-session automation with replay fixtures.
- Run at least two full exhibition-day soak tests on final hardware.
- Monitor memory, dropped frames, p95 inference latency, tracking loss, recoveries,
  and session completion.
- Test under real lighting, visitor distance, noise, clothing, and crowd conditions.
- Have someone other than the developer execute the installation and recovery runbook.

### Freeze policy

- Freeze content before the final soak tests.
- After release-candidate freeze, accept only issues that threaten safety, cultural
  correctness, completion, recovery, or exhibition operation.
- Every accepted fix reruns the relevant fixture suite and soak test.

### Exit gate

- Cultural, product, technical, and privacy sign-off are recorded.
- Full-day soak tests pass without manual intervention.
- Release artifact, checksums, installer, rollback, spare media, and runbook exist.
- A technician can recover the installation without source-code knowledge.

### Deliverable

The exhibition release candidate.

## 15. Recommended issue order

Create work items in this dependency order:

```text
M0 project baseline
 └─ M1 camera laboratory
     └─ M2 landmark laboratory
         ├─ M3 gesture laboratory
         │   └─ M5 first vertical slice
         └─ M4 gameplay simulator
             └─ M5 first vertical slice
                 ├─ M6 content pipeline
                 │   └─ M7 final gestures
                 └─ M8 audio and visuals
                     └─ M9 kiosk hardening
                         └─ M10 validation and freeze
```

Some work can overlap after its dependency is stable:

- Story research and cultural consultation can run during M0–M5.
- Art direction and audio planning can run during M3–M7.
- Kiosk research can begin early, but production hardening waits for a stable vertical
  slice.

## 16. Testing pyramid

### Pure unit tests

- feature extraction;
- gesture scoring and temporal smoothing;
- content validation;
- state-machine transitions;
- retry and timeout policies.

These should be the fastest and most numerous.

### Contract tests

- camera adapter behavior;
- vision worker message protocol;
- MediaPipe-to-domain normalization;
- renderer and audio command interfaces;
- diagnostics event sanitization.

### Replay tests

- full gesture sequences;
- jitter, partial effort, tracking loss, and recovery;
- accelerated multi-session gameplay;
- regression fixtures from consented participant tests.

### Browser end-to-end tests

- boot through reset;
- abandonment and assisted completion;
- asset failure and recovery;
- replay-driven deterministic visual flows.

### Hardware tests

- camera and lighting;
- inference latency;
- audio output;
- kiosk launch and watchdog;
- power-cycle recovery;
- soak and participant testing.

Automated tests cannot replace the hardware and human layers. Hardware tests cannot
replace deterministic regression tests. We need both.

## 17. Definition of done for every module

A module is not done unless:

- it exposes a typed, documented contract;
- callers do not import its internal implementation;
- it has a fake or replay path when hardware is involved;
- normal and failure behavior are tested;
- resources are cleaned up on stop/reset;
- useful performance or health signals are observable;
- logs contain no images or identifying visitor data;
- it works offline in a production build;
- limitations and tuning values are documented;
- its milestone exit gate passes on target hardware.

## 18. What we need from the project owner, and when

| When | Decision or material |
|---|---|
| Before M0 completes | target PC, camera, display, browser, interaction start method |
| During M2–M3 | provisional gesture references |
| Before M7 | expert-approved final gestures and cultural explanations |
| Before M6 content freeze | story, character, script, languages, rights status |
| Before M8 completes | approved costume art, narration, music, branding |
| Before M10 | final hardware, physical layout, operator expectations |

This sequencing means technical work can start immediately without fabricating
cultural content. Placeholder assets are explicitly disposable; architecture and
tests are not.

## 19. First recommended development cycle

Do not begin with the full game. The first cycle should be:

1. M0 project baseline.
2. M1 camera laboratory.
3. M2 landmark laboratory.
4. M3 one placeholder gesture.
5. M4 button-driven gameplay simulator.
6. M5 one-gesture vertical slice.

At that checkpoint we reassess. If tracking is unreliable, we improve the physical
setup or vision adapter before investing in final artwork. If the gameplay flow is
confusing, we revise the state machine before recording narration. If both work, the
remaining work becomes controlled content expansion and exhibition hardening rather
than a risky integration event.
