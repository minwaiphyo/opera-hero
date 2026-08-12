# Opera Hero — AI Handover: Visitor Game Frontend

## Purpose

This file summarizes the code delivered on branch `feat/opera-hero-game`
([PR #11](https://github.com/minwaiphyo/opera-hero/pull/11)), which implements the
complete visitor-facing game described in
[FRONTEND_GAME_HANDOFF.md](./FRONTEND_GAME_HANDOFF.md). Read that file first for the
product context (what the booth is, the three gestures, the display constraints); this
file picks up from there and describes what actually exists now, and what a teammate or
another AI assistant should do next.

This is a snapshot as of 2026-08-12. Before trusting anything below, check it against
the current code — `git log`, `git blame`, and the files themselves are always the
source of truth over this document.

## What this PR does

It replaces the M0 baseline page as the site's front door with a working, end-to-end
game: camera → live pose/hand tracking → an on-screen visitor mirror with skeleton
overlay → a three-level session (Orchid Finger → Opening Door → Water Sleeves) → scoring
against practitioner-derived references → results → completion. There is **no simulated
mode** — this runs the real M1–M3 camera, vision-worker, and scoring pipeline that
already existed in the repo. `docs/project-tracking/FRONTEND_GAME_HANDOFF.md` proposed
building a simulator first (M4) and integrating later; that plan was superseded — see
`DEC-009` in `DEVELOPMENT_STATUS.md` — in favor of wiring the real pipeline directly.

**`DEVELOPMENT_STATUS.md` still lists M4 as "Not started" and M5 as blocked.** That
ledger has not been updated to reflect this PR. Updating it (new capability rows for
`src/gameplay/**`, milestone status, readiness level) is one of the first things whoever
picks this up should do — see [Next steps](#next-steps).

## Where the code lives

Everything new is under `src/gameplay/`, structured as three layers that don't reach
past each other:

```
src/gameplay/
├── contract.ts          the boundary type: GameView, GameActions, screen/tracking enums
├── contract.test.ts      guards contract.ts against drifting from the scoring domain
├── content.ts            all visitor-facing copy, gesture metadata, score-band language
├── content.test.ts
├── gameplay.css           single stylesheet for the whole game (1,263 lines)
├── GamePage.tsx           composition root, mounted at route "game" (see routes.ts)
├── runtime/                owns camera, vision worker, capture policy, evaluators
│   ├── useGameRuntime.ts    the only module that imports the real pipeline
│   ├── gameFlow.ts          pure state machine: FlowState + flowReducer (no React, no timers)
│   ├── gameFlow.test.ts
│   ├── useBoothCamera.ts    thin, no-picker camera lifecycle for an unmanned booth
│   ├── useVisionFrames.ts   feeds the vision worker, publishes landmarks via a ref (not state)
│   ├── VisitorMirror.tsx    mirrored canvas: camera picture + live skeleton overlay
│   ├── overlayPainter.ts    canvas drawing for the skeleton overlay
│   ├── overlayPainter.test.ts
│   ├── poseGraph.ts         MediaPipe landmark index topology (which points connect)
│   ├── trackingPrompt.ts    turns tracking quality into visitor-facing guidance text
│   └── trackingPrompt.test.ts
└── ui/                     pure presentation: renders GameView, emits GameActions only
    ├── GameShell.tsx        chrome + screen router
    ├── GameShell.test.tsx
    ├── screens.tsx          all eight screens (see below)
    ├── PractitionerGuide.tsx  plays the reference demonstration clip per gesture
    ├── PractitionerGuide.test.tsx
    └── components/
        ├── Ornaments.tsx     lanterns, gesture glyphs/pictograms
        └── Pieces.tsx        smaller shared UI pieces
```

Supporting changes outside `src/gameplay/`:

- `src/app/routes.ts`, `src/app/App.tsx` — the game is now the default route; `/baseline`,
  `/lab/camera`, `/lab/landmarks` remain reachable by typing the URL but are no longer
  linked from anywhere (`DevelopmentNav.tsx` was deleted).
- `src/vision/visionWorkerClient.ts` — logs `delegate=GPU`/`delegate=CPU` on worker ready,
  since silent CPU fallback was the leading cause of "it's laggy" reports.
- `scripts/build_practitioner_guides.mjs` — generates the three files under
  `public/guides/` (`.mp4` + `.jpg` poster per gesture) from the same practitioner
  footage and trim window the scoring references were built from, so the demonstration
  the visitor watches is provably the same performance they're scored against. Needs
  `ffmpeg` and the restricted source footage (not in the repo) to *regenerate*; the
  output clips themselves **are** committed under `public/guides/`, so a fresh checkout
  can run the booth without ever running this script.
- `docs/project-tracking/hardware-baseline.md` — records `DEC-009` (session starts on a
  Start button press, not ambient presence).
- `README.md` — "Try the game" quick-start section.

## The three-layer contract

`contract.ts` is the file to read first. The runtime and the UI never import each
other's internals — they only share `GameView` (what to render) and `GameActions` (what
the UI can ask for: `tutorial`, `start`, `next`, `retry`, `quit`). This means:

- The UI (`ui/`) has zero knowledge of cameras, workers, or evaluators. `GameShell.tsx`
  and `screens.tsx` are straightforward to test with a fake `GameView` (see
  `GameShell.test.tsx`) and straightforward to restyle without touching logic.
- The runtime (`useGameRuntime.ts`) is the *only* file that imports the camera service,
  the vision worker client, and the three `use*LiveScoring` hooks from
  `src/labs/camera/`. If the scoring or camera domain changes shape, this is the one
  file that needs to update.
- `gameFlow.ts` is a plain reducer with no React and no timers — `useGameRuntime` feeds
  it ticks (`{type: "tick", deltaMs, present}`), capture-phase updates from the live
  scorers, and camera-readiness changes; it returns the next `FlowState`. This is what
  makes `gameFlow.test.ts` able to test the entire session state machine (abandonment,
  recovery, dwell timers, level progression) without a browser, a camera, or React.

## Screen flow

Eight screens, defined in `contract.ts` (`GAME_SCREENS`) and rendered by
`GameShell.tsx` → `screens.tsx`:

```
attract → tutorial (optional preview, doesn't start a session)
attract → learn (level 1) → countdown → attempt → result → learn (level 2) → ... 
        → result (level 3) → complete → attract
```

`recovery` can be entered from almost anywhere (camera lost, visitor steps out of
frame) and returns either to where the visitor left off (`resumeScreen`) or, after
`ABANDON_AFTER_MS` (18s), all the way back to `attract`. The rules and every timing
constant (`DWELL_MS`, `ABSENT_GRACE_MS`, `ABANDON_AFTER_MS`, `CAMERA_GRACE_MS`) live at
the top of `gameFlow.ts` with comments explaining the reasoning — read those before
changing pacing, they encode real product decisions (e.g., a session only ever starts
from a deliberate Start press, never from ambient presence, per `DEC-009`).

`countdown` and `attempt` are **not timed by the game** — `capturePhase` comes from the
already-approved M3 capture policy inside the three `use*LiveScoring` hooks
(`src/labs/camera/use{OrchidFinger,OpeningDoor,WaterSleeves}LiveScoring.ts`), and
`gameFlow.ts` only follows it (see the big comment block at the top of
`useGameRuntime.ts`). Do not reimplement countdown/recording timing in the gameplay
layer — it already exists and is tuned per gesture.

## Content and cultural status

All visitor-facing copy lives in one file: `content.ts` (gesture names, steps,
meanings, score-band language, recovery/tracking copy). This is intentional —
translators, practitioners, or a non-technical reviewer only need to look at one file.

**Nothing in `content.ts` is approved cultural content.** The header comment says so
explicitly, and it's enforced structurally: gesture names, Chinese characters, and
meanings are marked placeholder pending review by the practitioner (Master Aw Yeong
Peng Mun) and Kong Chow Wui Koon, per
[cultural-gameplay-scope.md](./cultural-gameplay-scope.md). Do not treat any of this
copy as final without checking that file's status first.

Score bands (`SCORE_BANDS` in `content.ts`) are deliberately encouragement-only
language ("Radiant", "Finding the line") — there is **no approved pass/fail threshold**.
`content.test.ts` enforces that nothing in the band language reads as
pass/fail/success/failure. If a visitor acceptance threshold gets approved later, it
still should not change this file's tone without a product decision — check
`DEVELOPMENT_STATUS.md`'s decision log first.

## What's tested

- `gameFlow.test.ts` — the state machine: level progression, retry, abandonment,
  recovery/resume, camera-loss handling, dwell timers.
- `contract.test.ts` — guards that `contract.ts`'s `GESTURE_IDS` never drifts from
  `src/domain/gestures/scoring/gestureScoringContract.ts`'s own list (the two are
  intentionally duplicated so screens never import the scoring domain).
- `content.test.ts` — every gesture has complete, length-bounded copy; score-band
  language never reads as pass/fail.
- `overlayPainter.test.ts`, `trackingPrompt.test.ts` — pure logic, no DOM.
- `GameShell.test.tsx`, `PractitionerGuide.test.tsx` — component-level, React Testing
  Library, fake view models/props (no real camera or worker).
- `tests/e2e/baseline.spec.ts` was updated for the new routing (game at `/`, baseline
  moved to `/baseline`).

All CI checks on PR #11 are currently green (`quality` on macOS/Ubuntu/Windows,
GitGuardian). Run locally with `npm test` (unit/component) and `npm run test:e2e` (or
check `package.json` for the exact script names) before making further changes.

## Known gaps and rough edges

- **`DEVELOPMENT_STATUS.md` is stale.** It still shows M4 "Not started" / 0%. This PR's
  work isn't reflected in the milestone table, capability registry, or readiness level.
- **Cultural content is placeholder**, as above — do not ship without practitioner sign-off.
- **No visitor pass/fail threshold** has been approved; the UI is deliberately built so
  none is implied.
- **Live-scoring hooks are reused from `src/labs/camera/`, not owned by `src/gameplay/`.**
  `useGameRuntime.ts` has a comment noting these would sit more naturally under
  `src/domain/gestures/live/`; moving them is the scoring owner's call, and
  `useGameRuntime.ts` is the only file that would need to change if that happens.
- **Practitioner guide regeneration needs restricted footage** not in the repo
  (`docs/practitioner-footage/`); only needed if a reference clip changes, not for normal
  development.
- **Single 1,263-line `gameplay.css`.** Works, but if the UI grows further this is a
  candidate for splitting per-screen or per-component.
- **Only tested against the M0 hardware baseline** (Chrome on the 3200×2000 dev laptop,
  per `hardware-baseline.md`). Other resolutions/aspect ratios and the eventual
  exhibition TV display are unverified.
- **GPU/CPU delegate fallback is logged, not surfaced to the visitor** — `/baseline`
  gives a manual capability report, but the game itself doesn't warn if it silently
  degraded to the slower CPU path.

## Next steps

1. Update `DEVELOPMENT_STATUS.md`: mark M4 appropriately (the state-machine simulator
   plan was superseded by direct integration — decide whether M4 should be marked
   complete via this PR, reworded, or merged into M5), add capability rows for
   `src/gameplay/**`, and reassess the exhibition readiness level.
2. Get practitioner and Kong Chow Wui Koon sign-off on the copy in `content.ts`
   (gesture names, Chinese text, meanings) before any public showing.
3. Test on non-development hardware/resolutions — the CSS and layout have only been
   proven on the M0 baseline laptop.
4. Decide whether to relocate the `use*LiveScoring` hooks out of `src/labs/camera/` into
   a domain-owned location, per the comment in `useGameRuntime.ts`.
5. Once M5 ("first vertical slice") criteria in `ROADMAP.md` are reviewed against what
   this PR actually delivers, update or retire that milestone's blocked status.

## Quick start for a new session

```bash
npm install
npm run dev
```

Open the printed URL in Chrome, allow camera access — the root URL is the game. See
`README.md`'s "Try the game" section and `src/app/routes.ts` for how `/baseline`,
`/lab/camera`, and `/lab/landmarks` remain reachable for development.
