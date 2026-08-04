# M3 Live Orchid Finger Increment 23 Verification

## Scope

This increment exposes the Orchid Finger evaluator in the developer camera
laboratory beside a 41-frame practitioner landmark guide. It retains the shared
five-second countdown and guarded automatic completion behavior. Orchid Finger
requires two seconds of continuous final stillness before completion, allowing
short intentional holds within the movement without ending the attempt.
Its 0.08 stillness threshold uses the stable wrist and four knuckle anchors first,
excluding noisier fingertips from capture completion so pose/fingertip jitter does
not repeatedly restart the final-pose timer. Finger landmarks remain part of
similarity scoring. Arm motion is used only when hands are unavailable.
Automatic completion is blocked for the first 15.6 seconds of recording so an
internal hold cannot end the attempt before the first reference replay finishes.
Its gesture-specific buffer permits 30 seconds and 1,200 worker frames, avoiding
the shared short-gesture limits during the 15.6-second reference plus final hold.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-119 | Live capture and session-reset hook | Passed |
| EV-M3-120 | Countdown-held reference playback | Passed |
| EV-M3-121 | Three-gesture selection and state isolation | Passed |
| EV-M3-122 | Focused integration suite | Passed: 10 tests across 3 files |
| EV-M3-123 | Full unit and component suite | Passed: 225 tests across 54 files |
| EV-M3-124 | TypeScript, ESLint, and production build | Passed |

## Physical review

1. Start the camera and select **Orchid Finger**.
2. Confirm the reference is visible beside the mirrored camera preview.
3. Start an attempt; use the five-second countdown to enter the ready pose.
4. Follow the complete guide sincerely and confirm automatic or manual completion
   produces similarity, tracking, and per-signal results.
5. Confirm both finger-shape rows have scores when the hands remain visible.
6. Repeat once with an obviously different visible hand shape and record both
   overall scores.
7. Switch to Opening Door and Water Sleeves and confirm their attempt state is idle.

**Result:** Passed on Chrome / Target A. The project owner confirmed that the
15.6-second first-loop minimum, palm-based jitter handling, two-second final hold,
and automatic completion work in the live camera flow. Comparative score tuning
remains future work and is not treated as completed calibration.
