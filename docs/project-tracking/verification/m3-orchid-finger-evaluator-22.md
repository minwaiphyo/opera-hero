# M3 Orchid Finger Evaluator Increment 22 Verification

## Scope

This increment adds offline Orchid Finger temporal alignment and soft similarity.
It does not yet connect Orchid Finger to the live camera laboratory or define a
festival pass/fail threshold.

## Scoring behavior

- Dynamic time warping aligns attempts performed at different speeds.
- Arm placement, palm placement, palm direction, and hand shape have separate,
  inspectable scores.
- Hand shape aggregates explicit finger extension, curl, and thumb-to-fingertip
  relationships; it is not an opaque learned classifier.
- Missing hand landmarks produce missing evidence instead of an automatic zero.
- Required pose coverage controls tracking status and prevents untracked attempts
  from receiving a valid score.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-114 | Canonical and time-stretched alignment | Passed |
| EV-M3-115 | Missing hand and required-pose behavior | Passed |
| EV-M3-116 | Incorrect finger-shape discrimination | Passed |
| EV-M3-117 | Full unit and component suite | Passed: 217 tests across 51 files |
| EV-M3-118 | TypeScript, ESLint, and production build | Passed |

## Next step

Integrate Orchid Finger into the live camera scoring laboratory with its reference
guide, then collect sincere, partial, and incorrect physical attempt results for
festival-oriented tuning.
