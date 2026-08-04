# M3 Live Water Sleeves Scoring Increment 11 Verification

## Scope

This increment connects the bounded Water Sleeves attempt buffer to the normalized
landmark results already returned by the camera laboratory's single vision worker.
It adds a developer scoring panel without opening another camera stream or creating
another MediaPipe worker.

## Behavior

- Start, finish, cancel, and reset one live Water Sleeves attempt.
- Observe live tracking state, elapsed time, buffered samples, and usable samples.
- Automatically stop at the attempt buffer's 12-second or 300-sample bound.
- Evaluate the compact pose-arm trajectory against the committed practitioner
  reference after completion.
- Show soft similarity, tracking coverage/status, alignment count, and per-signal
  diagnostics.
- State explicitly that no visitor pass threshold has been approved.
- Retain landmarks-derived features only; no camera pixels, image bitmaps, or video
  recordings are stored by scoring.
- Reset scoring state when the active camera session changes.
- Display a compact pose-only practitioner reference beside the live camera.
- Loop the normal-pace 7.7-second guide and restart it automatically when an
  attempt begins or manually when requested.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-058 | Live scoring hook and panel component tests | Passed |
| EV-M3-059 | Full unit and component suite | Passed: 168 tests across 35 files |
| EV-M3-060 | Strict TypeScript check and ESLint | Passed |
| EV-M3-061 | Production build | Passed; existing MediaPipe warnings unchanged |
| EV-M3-062 | Practitioner reference-guide playback | Passed: loop and restart behavior covered |

## Project-owner verification

- [ ] Start the camera and wait for the `Vision worker · GPU · Pose LITE` badge.
- [ ] Confirm the practitioner landmark guide is visible beside the camera and loops.
- [ ] Select `Replay guide` and confirm it restarts from the beginning.
- [ ] Confirm `Start attempt` is enabled only while the camera is active.
- [ ] Start an attempt while standing fully in frame; confirm tracking becomes
  `tracked` and the buffered/usable counts increase.
- [ ] Confirm starting an attempt also restarts the guide so both movements begin
  together.
- [ ] Perform the Water Sleeves movement once, then select `Finish & score`.
- [ ] Confirm a soft similarity result and tracking diagnostics appear.
- [ ] Confirm temporary pose loss changes the tracking state without crashing.
- [ ] Start another attempt and confirm the earlier score is cleared.
- [ ] Stop the camera and confirm the scoring state returns to idle.
- [ ] Confirm the existing body/hand overlay and vision diagnostics remain responsive.

## Interpretation

The score is currently an engineering diagnostic, not a festival pass/fail result.
Physical attempts will inform later parameter review, but this increment does not
silently tune or approve a visitor threshold.

## Next increment

Use physical Water Sleeves attempts to verify live score behavior and capture the
observations needed for conservative scorer tuning before implementing Opening Door
and Orchid Finger scoring.
