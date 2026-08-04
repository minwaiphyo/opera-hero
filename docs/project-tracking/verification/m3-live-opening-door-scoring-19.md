# M3 Live Opening Door Scoring Increment 19 Verification

## Scope

This increment adds Opening Door to the camera laboratory using the existing
five-second fixed countdown and hesitation-safe automatic completion behavior. It
does not establish a visitor pass threshold or add production gameplay.

## Behavior

- Select Water Sleeves or Opening Door from one developer gesture selector.
- Prevent gesture switching while an attempt is active.
- Start recording immediately after the five-second countdown.
- Feed worker pose and hand frames into an Opening Door-specific live trajectory.
- Evaluate the completed trajectory against the compact two-take reference.
- Display overall, tracking, aligned-pair, and per-signal results.
- Play a synchronized 41-frame pose-and-hand practitioner guide over 8.7 seconds.
- Preserve the existing Water Sleeves scoring and tuning tool.
- Store no camera video or pixels.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-098 | Live Opening Door hook integration | Passed |
| EV-M3-099 | Opening Door guide countdown/playback | Passed |
| EV-M3-100 | Camera-lab gesture selection | Passed |
| EV-M3-101 | Focused live integration suite | Passed: 10 tests |
| EV-M3-102 | Full unit and component suite | Passed: 201 tests across 46 files |
| EV-M3-103 | TypeScript, ESLint, and production build | Passed |

## Physical verification

- [x] Start the camera and select `Opening Door`.
- [x] Confirm the Opening Door panel and pose-and-hand guide appear.
- [x] Start an attempt and enter the starting pose during the five-second countdown.
- [x] Confirm recording and guide playback begin together at zero.
- [x] Perform the full Opening Door sequence and hold the final pose.
- [x] Confirm automatic completion produces a soft similarity result.
- [x] Confirm tracking coverage, aligned pairs, and per-signal results appear.
- [x] Repeat once slowly and confirm the attempt still completes.
- [x] Switch back to Water Sleeves and confirm its panel and tuning tool return.

Project-owner physical review passed on 2026-08-04. Accuracy remains provisional
until the cross-gesture tuning increment.

## Next step

After physical flow approval, continue with normalized Orchid Finger features.
Opening Door accuracy tuning remains deferred to the cross-gesture tuning increment.
