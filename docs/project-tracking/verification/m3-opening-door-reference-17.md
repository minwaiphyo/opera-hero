# M3 Opening Door Trajectory and Reference Increment 17 Verification

## Scope

This increment converts Opening Door frame features into normalized temporal
trajectories and generates one compact reference envelope from the two approved
normal-pace practitioner takes. It does not implement similarity evaluation, live
capture, or a pass threshold.

## Reference policy

- Include `opening-door-normal-take-1` and `opening-door-normal-take-2`.
- Exclude the slow pilot from the canonical envelope; retain it for diagnostics.
- Normalize every take to progress from 0 to 1 before aggregation.
- Generate 41 smoothed progress points using medians across both takes.
- Store feature targets and tolerances only; no replay frames, landmarks, pixels,
  or video are committed in the compact reference.

## Coverage

| Fixture | Pose coverage | At least one associated hand |
|---|---:|---:|
| Normal take 1 | 100.0% | 83.4% |
| Normal take 2 | 100.0% | 97.7% |

Elbow and wrist paths are eligible as required signals. Palm position, direction,
and openness remain optional enhancements so intermittent hand loss does not erase
a valid arm movement.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-087 | Trajectory coverage tests | Passed |
| EV-M3-088 | Multi-take envelope tests | Passed |
| EV-M3-089 | Real two-take reference generation | Passed: 41 points |
| EV-M3-090 | Full unit and component suite | Passed: 193 tests across 43 files |
| EV-M3-091 | TypeScript, ESLint, and production build | Passed |

## Next step

Implement temporal alignment and soft similarity evaluation for Opening Door using
required arm paths and coverage-aware optional palm signals.
