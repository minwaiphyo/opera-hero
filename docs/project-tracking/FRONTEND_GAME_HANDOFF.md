# Opera Hero — Frontend Game Handoff

## Purpose

This is the starting context for a teammate—or a new AI assistant—building the
visitor-facing Opera Hero game. Read this file together with
[ARCHITECTURE.md](./ARCHITECTURE.md) and
[DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md).

The immediate frontend objective is to build a polished, responsive game shell that
can run against simulated gameplay data first, then connect to the existing camera,
landmark, and scoring pipeline through one narrow integration boundary.

Do not rebuild the camera or scoring laboratories as the game UI. They are developer
tools and reference implementations.

## Product context

- Opera Hero is an offline, browser-based festival booth experience.
- It runs locally in Google Chrome on Windows 11 with an integrated or USB camera.
- A visitor is expected to stand approximately 1–2 metres from the camera.
- The current development display is 3200 × 2000. The final display will probably be
  a TV, so layouts must adapt to other landscape resolutions and aspect ratios.
- The booth is unmanned. Camera presence should eventually begin a session, and an
  abandoned session must return to the attract screen automatically.
- Camera frames and identifying visitor data must not be saved or uploaded.

The three festival levels are:

1. Orchid Finger
2. Opening Door
3. Water Sleeves

## Current technical position

M0–M3 provide the working technical foundation:

- camera selection, preview, recovery, and diagnostics;
- MediaPipe Pose and Hand Landmarker inference in a Web Worker;
- normalized pose and hand landmark frames;
- practitioner-derived reference fixtures for all three gestures;
- deterministic temporal scoring using dynamic time warping and gesture-specific
  movement-completeness checks;
- automatic attempt capture with a five-second countdown, minimum first-reference-
  cycle duration, stillness completion, and a maximum timeout;
- live scoring for all three gestures in the camera laboratory.

M4—the gameplay state-machine simulator—is the next milestone. The frontend can be
built in parallel using a simulated runtime, provided it follows the contract in
this document.

## Source-of-truth files

Use these files to understand existing behaviour. Do not copy their logic into UI
components.

| Concern | Current source |
|---|---|
| Gesture IDs, level order, and shared score contract | `src/domain/gestures/scoring/gestureScoringContract.ts` |
| Gesture-specific evaluators | `src/domain/gestures/scoring/*Evaluator.ts` |
| Attempt capture policy | `src/domain/gestures/live/*AutomaticCapture.ts` |
| Live scoring orchestration | `src/labs/camera/use*LiveScoring.ts` |
| Camera lifecycle | `src/camera/**` and `src/labs/camera/useCameraLab.ts` |
| Worker landmark pipeline | `src/vision/**` |
| Current end-to-end developer integration | `src/labs/camera/CameraLabPage.tsx` |
| Practitioner reference playback | `src/labs/camera/*ReferenceGuide.tsx` |

The lab currently proves the complete path:

```text
camera frame
  → vision worker
  → normalized VisionLandmarkFrame
  → active live-scoring hook
  → automatic attempt buffer
  → gesture evaluator
  → score result
```

## Integration rule

The visitor-facing frontend must not import MediaPipe, read raw camera frames, score
landmarks, or run its own timers. It should render a slow-changing gameplay view
model and send user/session intents back to a runtime controller.

The target boundary for M4 is conceptually:

```ts
export type GameScreen =
  | "attract"
  | "welcome"
  | "instructions"
  | "demonstration"
  | "countdown"
  | "attempt"
  | "feedback"
  | "cultural-insight"
  | "level-transition"
  | "completion"
  | "recovery";

export type TrackingPrompt =
  | "ready"
  | "move-closer"
  | "move-farther"
  | "step-into-frame"
  | "tracking-limited";

export interface GameScoreView {
  overallScore: number;          // 0..1; UI formats this as a percentage
  movementCompleteness: number;  // 0..1
  trackingCoverage: number;      // 0..1
  trackingStatus: "good" | "limited" | "insufficient";
}

export interface GameViewModel {
  screen: GameScreen;
  level: 1 | 2 | 3 | null;
  gestureId: "orchid-finger" | "opening-door" | "water-sleeves" | null;
  gestureName: string | null;
  countdownSeconds: number | null;
  trackingPrompt: TrackingPrompt;
  score: GameScoreView | null;
  referencePlaybackKey: string | null;
  message: string | null;
}

export interface GameActions {
  beginSession(): void;
  continue(): void;
  startAttempt(): void;
  retryAttempt(): void;
  cancelSession(): void;
}
```

These names are the proposed M4 contract, not existing exports yet. Frontend work
should use a local simulator that implements this shape. When M4 lands, replace the
simulator provider rather than rewriting screens.

## How scoring should affect the UI

The evaluators currently produce:

- `overallScore`: soft similarity after tracking and movement-completeness penalties;
- `movementCompleteness`: whether the important gesture trajectory was actually
  performed;
- `trackingCoverage`: how much usable tracking was available;
- `trackingStatus`: `good`, `limited`, or `insufficient`;
- per-signal scores and aligned-pair counts for developer diagnostics.

Only the first four belong in the gameplay integration contract. Per-signal scores,
raw landmarks, and dynamic-time-warping diagnostics must stay out of the main visitor
UI.

Important rules:

- Do not hard-code a pass mark. No visitor acceptance threshold has been approved.
- Treat the score as supportive feedback, not an expert judgement of cultural skill.
- If tracking is `insufficient`, prompt the visitor to reposition or retry. Never
  present poor tracking as poor performance.
- Format values as percentages only in presentation code; preserve `0..1` values in
  state and contracts.
- The UI must remain usable when hand landmarks are missing. Water Sleeves commonly
  obscures the hands, and its evaluator deliberately relies more heavily on body and
  wrist trajectories.

## Expected visitor flow

The frontend should be able to render this complete sequence from simulated state:

```text
Attract
  → visitor detected
  → Welcome
  → Level instructions
  → Reference demonstration
  → 5-second countdown
  → Live attempt beside reference guide
  → Feedback
  → Cultural insight
  → Next level
  → Completion
  → Attract
```

Also design explicit recovery states for:

- nobody in frame;
- visitor too close or too far;
- temporarily limited tracking;
- camera permission/device failure;
- visitor abandonment/session timeout.

During a live attempt, the first complete reference cycle is protected from automatic
stillness termination. The frontend should not invent a separate attempt timer or
stop condition. It displays the runtime's countdown/capture state and may expose a
clearly secondary cancel action for development or recovery.

## Frontend work that can start now

Build the screens as presentational React components driven entirely by props:

1. attract and presence-ready screen;
2. welcome/story introduction;
3. level introduction and gesture instructions;
4. reference demonstration and camera comparison layout;
5. countdown and recording cues;
6. score/encouragement feedback;
7. cultural-insight interstitial;
8. level transition and final completion;
9. recovery and tracking-guidance overlays.

Create a small development simulator that exposes controls for every `GameScreen`,
tracking prompt, and representative score. This is a frontend test harness, not the
production state machine.

Use placeholder copy and media through a central content object. Do not scatter final
story text, file paths, score bands, or timings across components.

## Suggested ownership boundaries

To reduce merge conflicts, the frontend team should initially own new files under:

```text
src/gameplay/ui/**
src/gameplay/content/**
src/gameplay/simulator/**
src/gameplay/gameplay.css
```

The scoring/vision owner retains:

```text
src/domain/gestures/**
src/vision/**
src/camera/**
src/labs/**
scripts/**
public/fixtures/**
```

Shared integration files are conflict hotspots:

```text
src/app/App.tsx
src/app/routes.ts
src/styles.css
package.json
```

Nominate one person to integrate changes to those files. The frontend branch should
avoid modifying them until its components and simulator are reviewable, then add one
small route in a dedicated integration commit.

## UI constraints

- Design landscape-first, but do not assume exactly 3200 × 2000.
- Prefer responsive proportions, `clamp()`, grid/flex layouts, and bounded readable
  widths over pixel-positioned elements.
- Keep the visitor, reference, countdown, and primary feedback visible without
  scrolling during an attempt.
- Developer diagnostics must be collapsible or absent in the visitor route.
- Use high contrast and very large type that can be read from 1–2 metres.
- Keep primary interactions understandable without a mouse; the final booth is
  presence-led and unmanned.
- Respect reduced motion and provide subtitles for narration.
- Never display raw internal errors to visitors. Map them to recovery instructions.

## Reference playback

The existing lab reference guides render practitioner landmark fixtures, not videos.
They can inform the frontend implementation, but the production component should be
wrapped behind a simple presentation API such as:

```ts
type GestureReferenceProps = {
  gestureId: "orchid-finger" | "opening-door" | "water-sleeves";
  playing: boolean;
  restartKey: string | null;
};
```

Current approximate first-cycle durations are gesture-specific—about 15.6 seconds
for Orchid Finger, 8.7 seconds for Opening Door, and 7.7 seconds for Water Sleeves.
Do not duplicate these durations in frontend code; the runtime/capture policy remains
authoritative.

## Testing expectations

For each frontend increment:

- add component tests for visible state and emitted action callbacks;
- test every screen with long and missing copy;
- test `good`, `limited`, and `insufficient` tracking states;
- test representative scores without asserting an unapproved pass threshold;
- verify the attempt layout at the laptop viewport and at least one 16:9 TV viewport;
- keep camera, worker, and evaluator code mocked in frontend tests;
- run `npm run check` before handing work back for integration.

The simulator should make all visitor states reproducible without a camera. Real
camera/scoring verification remains in the camera laboratory until the M4 runtime
adapter is integrated.

## Recommended frontend commit sequence

1. `feat(gameplay): add frontend view contracts and simulator`
2. `feat(gameplay): add attract welcome and recovery screens`
3. `feat(gameplay): add level tutorial and reference layout`
4. `feat(gameplay): add countdown attempt and feedback screens`
5. `feat(gameplay): add cultural insight and completion flow`
6. `feat(gameplay): add responsive game route for simulator testing`
7. `feat(gameplay): integrate gameplay runtime with live scoring`

Do not combine the simulator, every screen, and live camera integration into one
commit. Each increment should remain independently testable and reversible.

## Definition of handoff success

The frontend is ready for live integration when:

- every visitor screen renders from a `GameViewModel` fixture;
- all actions are callback-driven;
- the complete three-level flow can be demonstrated with the simulator;
- attempt screens require no scrolling at the target viewports;
- no UI component imports from MediaPipe, vision workers, gesture evaluators, or lab
  hooks;
- replacing the simulator with the M4 runtime requires changing the provider/wiring,
  not the screens.

