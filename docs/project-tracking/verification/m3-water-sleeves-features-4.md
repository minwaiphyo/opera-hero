# M3 Water Sleeves Feature Foundation Increment 4 Verification

## Scope

This increment establishes normalized, interpretable frame features for Water Sleeves.
It deliberately does not introduce similarity thresholds or a visitor pass/fail score.

## Feature policy

- Shoulder width provides translation- and scale-independent normalization.
- Upper-arm direction and elbow position remain usable when a wrist is obscured.
- Elbow angle and wrist trajectory are optional whenever pose wrist visibility is low.
- An unreliable elbow removes only that arm, rather than invalidating the other arm.
- MediaPipe Hand Landmarker output is never consumed by Water Sleeves features.
- Frames without a reliable shoulder scale are rejected rather than scored incorrectly.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-019 | Water Sleeves feature unit tests | Passed: scale/translation invariance, partial occlusion, arm isolation, hand independence, and body-scale rejection |
| EV-M3-020 | Full Vitest suite | Passed |
| EV-M3-021 | Strict TypeScript check | Passed |
| EV-M3-022 | ESLint analysis | Passed |
| EV-M3-023 | Production build | Passed |

## Next increment

Expose these measurements in the gesture laboratory against an approved Water Sleeves
fixture. Then derive temporal trajectories and reference envelopes only from observable,
stable features.
