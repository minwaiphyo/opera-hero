# M3 Automatic Water Sleeves Attempt Capture Increment 13 Verification

## Scope

> Historical note: Increment 14 superseded the three-second countdown and
> movement-triggered onset described below with a fixed five-second countdown and
> immediate recording.

This increment removes mouse movement from the scored trajectory by placing an
automatic boundary detector before the existing bounded attempt buffer.

## Behavior

- Start with a three-second countdown so the operator can leave the mouse and adopt
  the ready position.
- Wait indefinitely for sustained normalized arm movement after the countdown.
- Require three consecutive movement frames before recording begins.
- Ignore small ready-position adjustments.
- Keep short internal pauses inside the recorded gesture.
- Finish after at least 1.5 seconds of movement capture followed by 1.2 seconds of
  sustained stillness.
- Retain the existing 12-second/300-sample capture bound.
- Keep manual finish and cancellation as technician fallbacks.
- Display prominent countdown, ready, and recording cues over the camera workbench.
- Use pose-derived arm features only; no pixels or video are retained.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-068 | Automatic boundary state-machine tests | Passed |
| EV-M3-069 | Live scoring integration tests | Passed |
| EV-M3-070 | Full unit and component suite | Passed: 176 tests across 38 files |
| EV-M3-071 | TypeScript, ESLint, and production build | Passed |
| EV-M3-072 | Browser smoke suite | Passed: 3 tests |

## Physical verification

- [x] Start an attempt while one hand is on the mouse.
- [x] During the countdown, move both arms into the ready position.
- [x] Confirm the state becomes `Ready` without immediately recording.
- [x] Make small posture adjustments and confirm recording does not begin.
- [x] Begin Water Sleeves and confirm the cue changes to `Recording` promptly.
- [x] Pause briefly inside the movement and confirm the attempt remains recording.
- [x] Finish the movement and hold the final pose; confirm scoring appears without
  returning to the mouse.
- [x] Confirm returning to the mouse after scoring does not alter the result.
- [x] Repeat once using manual finish and once using cancel.
- [x] Confirm a no-movement attempt remains ready and can be cancelled.

Project-owner physical review passed on 2026-08-04.

## Interpretation

If onset triggers during normal ready-position adjustment, increase onset
sensitivity conservatively. If genuine movement is clipped, reduce the required
consecutive onset frames or add a short compact-feature pre-roll. If valid internal
holds end the attempt early, extend the stillness duration before running the tuning
session.

## Next step

After physical boundary timing passes, resume the labelled Water Sleeves tuning
session from Increment 12.
