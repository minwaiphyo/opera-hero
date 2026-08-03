# M3 Water Sleeves Deterministic Regressions Increment 9 Verification

## Scope

This increment creates image-free, deterministic landmark-feature scenarios around the
committed Water Sleeves reference. The scenarios protect evaluator behavior from
regression; their expectations are not visitor completion thresholds.

## Scenarios

| Scenario | Expected behavior | Observed score | Tracking |
|---|---|---:|---|
| Nominal reference | Strong match | 100.0% | good |
| Slower timing | Strong match after alignment | 100.0% | good |
| Faster timing | Strong match after alignment | 99.3% | good |
| Conservative seeded noise | Strong match | 99.3% | good |
| Short five-sample occlusion | Preserve match with sufficient coverage | 100.0% | good |
| Prolonged occlusion | Suppress score due to missing required signals | 36.6% | insufficient |
| Reversed sequence | Low movement match despite good tracking | 24.3% | good |
| Displaced arm path | Low movement match despite good tracking | 5.6% | good |

Scale and translation invariance remain covered at the normalized feature-extraction
boundary. These trajectory-level scenarios operate after that normalization.

## Evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-048 | Regression scenario tests | Passed: all eight scenarios met their documented bounds |
| EV-M3-049 | Movement-versus-tracking separation | Passed: wrong paths retain good tracking while prolonged occlusion is insufficient |
| EV-M3-050 | Full unit and component suite | Passed |
| EV-M3-051 | TypeScript, ESLint, and production build | Passed |
| EV-M3-052 | Regression laboratory table | Passed in local browser with eight passing rows and no browser errors |

## Interpretation

Short occlusion remains unpenalized while required-signal coverage stays above 80%.
Prolonged occlusion is suppressed through the independent coverage factor. Reversed and
displaced sequences demonstrate that good camera tracking does not imply a movement
match.

## Manual verification

- [ ] Load either Water Sleeves fixture.
- [ ] Confirm the Deterministic regressions table contains eight scenarios.
- [ ] Confirm every row reports `pass`.
- [ ] Confirm prolonged occlusion is `insufficient` while reversed/displaced motion is
  `good` tracking with a low movement score.
- [ ] Confirm the table says its bounds are not visitor thresholds.

## Next increment

Define Opening Door pose/hand features and analyze both approved normal practitioner
takes. Reuse the normalization, observability, envelope, alignment, and regression
patterns only where their gesture-specific signals are appropriate.
