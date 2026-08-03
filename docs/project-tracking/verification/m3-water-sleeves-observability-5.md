# M3 Water Sleeves Feature Observability Increment 5 Verification

## Scope

This increment exposes Water Sleeves frame features in the Landmark Laboratory so
developers can inspect the measurements before defining temporal scoring tolerances.
The panel is shown only for fixtures whose IDs begin with `water-sleeves-`.

## Displayed diagnostics

- Required pose-arm policy and explicit zero hand influence.
- Number of currently usable arms and shoulder normalization scale.
- Per-arm upper-arm angle and normalized elbow position.
- Optional elbow angle and wrist position, reported as `occluded` when unavailable.
- Per-arm pose confidence and isolated unavailable-arm messaging.

## Evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-024 | Feature-panel component tests | Passed: idle policy, pose-only measurements, and wrist occlusion |
| EV-M3-025 | Full unit and component suite | Passed: 129 tests across 26 files |
| EV-M3-026 | Strict TypeScript check and ESLint | Passed |
| EV-M3-027 | Production build | Passed |
| EV-M3-028 | Real sleeved practitioner fixture replay | Passed in local browser: panel updated across frames, both pose arms usable, hand influence remained none, and no browser errors occurred |

## Manual verification

- [ ] Load `water-sleeves-front-with-sleeves.fixture.json` in the Landmark Laboratory.
- [ ] Confirm the Water Sleeves panel appears below the replay workbench.
- [ ] Start replay and confirm arm measurements change with the movement.
- [ ] Confirm `Hand influence` always reads `none` even though the replay reports no hands.
- [ ] Optionally load the no-sleeves fixture and observe any wrist or arm availability changes.
- [ ] Load a non-Water-Sleeves fixture and confirm the feature panel is absent.

## Next increment

Aggregate approved Water Sleeves replay frames into temporal feature trajectories and
measure signal coverage. Use those observations to choose envelope inputs; do not set
visitor-facing pass thresholds from a single frame.
