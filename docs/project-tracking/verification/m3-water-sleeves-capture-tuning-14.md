# M3 Water Sleeves Capture Tuning Increment 14 Verification

## Initial physical observations

| Label | Scores |
|---|---|
| Correct | 81.6%, 85.5%, 85.9% |
| Partial | 59.5%, 48.6%, 67.0% |
| Incorrect | 42.4%, 49.7%, 54.6% |

Correct and incorrect attempts separated in this bounded session. Their provisional
midpoint is 68.1%, but it is not adopted as a booth pass threshold because capture
began late and required an excessively long final hold.

## Tuning changes

- Increase the ready countdown from three seconds to five seconds.
- Remove movement-triggered onset entirely.
- Begin recording immediately when the countdown reaches zero.
- Start practitioner-guide playback at the same countdown boundary.
- Arm automatic final-stillness completion only after cumulative arm movement has
  occurred, so the initial ready pose cannot immediately complete the attempt.
- Prevent automatic completion for three seconds after the first meaningful
  movement, protecting early hesitation and internal pauses.
- Increase stillness tolerance from 0.015 to 0.025 to absorb landmark jitter.
- Reduce final stillness duration from 1.2 seconds to 0.8 seconds.
- Preserve the 1.5-second minimum recording duration and bounded capture limits.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-074 | Labelled physical tuning session | Passed with capture-timing follow-up |
| EV-M3-075 | Onset retention and completion regression tests | Passed |
| EV-M3-076 | Full unit and component suite | Passed: 179 tests across 38 files |
| EV-M3-077 | TypeScript, ESLint, and production build | Passed |

## Physical re-verification

- [ ] During the five-second countdown, enter the ready pose.
- [ ] Confirm recording and practitioner-guide playback begin immediately at zero.
- [ ] Confirm the beginning of the movement contributes to the resulting score.
- [ ] Include a short internal pause and confirm recording continues.
- [ ] Hold the final pose and confirm completion occurs in approximately one second.
- [ ] Repeat one correct, partial, and incorrect attempt and record their scores.

## Gate

Do not adopt 68.1% as a gameplay threshold until the timing changes pass physical
review and the representative attempts remain ordered correctly.

There is no motion-start threshold. Slow or subtle movement is recorded once the
five-second countdown ends.

## Outcome

Project-owner physical review passed on 2026-08-04 with moderate scoring accuracy.
The fixed start, early-hesitation guard, and final-hold completion are suitable for
continued development. Final thresholds and accuracy tuning are intentionally
deferred until Opening Door and Orchid Finger use the same live scoring flow.
