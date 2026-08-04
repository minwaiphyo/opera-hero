# M3 Opening Door Evaluator Increment 18 Verification

## Scope

This increment aligns an Opening Door attempt to the compact two-take reference and
returns a soft similarity evaluation through the shared gesture scoring contract.
It does not set a visitor pass threshold or add live camera UI.

## Scoring policy

- Use bounded dynamic time warping with a 25% progress window.
- Treat left/right elbow and wrist paths as required signals.
- Treat palm position, direction, and openness as lower-weight optional signals.
- Do not penalize an otherwise valid arm movement solely because optional hands are
  unavailable.
- Apply required-pose tracking coverage to the final soft score.
- Return per-signal similarity and coverage for later tuning.

## Real fixture results

| Fixture | Soft similarity | Required tracking | Aligned pairs |
|---|---:|---:|---:|
| Normal take 1 | 95.0% | Good, 92.6% | 175 |
| Normal take 2 | 95.3% | Good, 100.0% | 175 |
| Slow diagnostic take | 92.6% | Good, 100.0% | 156 |

The slow take remains outside reference generation; its result demonstrates tempo
tolerance rather than contributing to the canonical target.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-092 | Canonical and tempo-alignment tests | Passed |
| EV-M3-093 | Optional-hand and tracking-coverage tests | Passed |
| EV-M3-094 | Fully tracked displaced-path negative test | Passed |
| EV-M3-095 | Real practitioner fixture evaluation | Passed |
| EV-M3-096 | Full unit and component suite | Passed: 198 tests across 44 files |
| EV-M3-097 | TypeScript, ESLint, and production build | Passed |

## Next step

Integrate Opening Door into the fixed-countdown live attempt flow with its own
practitioner guide and developer score display.
