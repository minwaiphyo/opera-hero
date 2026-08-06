# M3 Orchid Finger Reference Increment 21 Verification

## Scope

This increment converts the three approved normal practitioner fixtures into
normalized trajectories and a compact, interpretable 41-point reference envelope.
It does not yet score attempts or change the live camera laboratory.

## Reference policy

- Normal takes 1, 2, and 3 contribute to the reference envelope.
- The slow take remains diagnostic and is not treated as a fourth normal example.
- Arm placement, palm placement, palm direction, individual finger extension and
  curl, and thumb-to-fingertip relationships remain explicit.
- The generated JSON contains aggregated features only: no pixels, video frames,
  raw pose landmarks, or raw hand landmarks.

## Fixture coverage

| Practitioner fixture | Pose | At least one hand | Use |
|---|---:|---:|---|
| Normal take 1 | 100.0% | 100.0% | Reference |
| Normal take 2 | 100.0% | 100.0% | Reference |
| Normal take 3 | 100.0% | 100.0% | Reference |
| Slow take | Diagnostic only | Diagnostic only | Future evaluator checks |

Coverage means that at least one usable hand was present; it does not assume that
both hands are continuously visible. Signal-level coverage remains available on
each extracted trajectory so later scoring can avoid treating missing evidence as
incorrect movement.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-109 | Three normal fixture coverage | Passed: 100.0% pose and at-least-one-hand coverage |
| EV-M3-110 | Trajectory and signal-coverage tests | Passed |
| EV-M3-111 | Envelope generation and image-free artifact tests | Passed |
| EV-M3-112 | Full unit and component suite | Passed: 212 tests across 50 files |
| EV-M3-113 | TypeScript, ESLint, and production build | Passed |

## Next step

Build the Orchid Finger temporal evaluator using dynamic time warping and soft,
coverage-aware similarity. Threshold tuning and live integration follow later.
