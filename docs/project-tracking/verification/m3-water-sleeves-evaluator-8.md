# M3 Water Sleeves Temporal Evaluator Increment 8 Verification

## Scope

This increment adds constrained temporal alignment and soft required-feature scoring
for a complete Water Sleeves trajectory. It remains a developer evaluator and does not
define visitor success or failure.

## Design

- Align candidate frames monotonically against the 41-point reference using dynamic
  time warping within a 25% progress window.
- Convert angular and elbow-position distances to continuous Gaussian membership
  scores instead of Boolean matches.
- Average only observable required signals at each aligned pair.
- Track required-signal availability separately from movement similarity.
- Apply no coverage penalty above 80%; reduce the overall score for prolonged missing
  required signals.
- Classify tracking as `good`, `limited`, or `insufficient` independently of movement
  quality.
- Continue excluding Hand Landmarker detections from Water Sleeves scoring.

## Evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-042 | Temporal evaluator unit tests | Passed: canonical motion, duplicate-frame slow motion, short dropout, prolonged dropout, altered path, and empty input |
| EV-M3-043 | Canonical sleeved evaluation | Observed: 98.9% soft score, 96.5% required-signal coverage, good tracking |
| EV-M3-044 | Supporting no-sleeves evaluation | Observed: 90.1% soft score, 100% coverage, good tracking |
| EV-M3-045 | Full unit and component suite | Passed |
| EV-M3-046 | TypeScript, ESLint, and production build | Passed |
| EV-M3-047 | Local browser evaluator display | Passed: both real fixtures displayed aligned diagnostics with no browser errors |

## Interpretation

Temporal alignment raises the supporting reference from an 80.5% rigid-progress fit
to a 90.1% soft score, demonstrating tolerance for timing variation. This is expected
for two practitioner demonstrations of the same underlying movement. It is not evidence
for a 90% public threshold, and no participant calibration is inferred from it.

## Manual verification

- [ ] Load the with-sleeves fixture and confirm approximately 98.9% soft score and
  96.5% tracking coverage.
- [ ] Load the without-sleeves fixture and confirm approximately 90.1% soft score and
  100% tracking coverage.
- [ ] Confirm both tracking statuses read `good`.
- [ ] Confirm the panel says these diagnostics are not a completion threshold.

## Next increment

Add deterministic evaluator regressions for timing variation, scale/translation,
conservative landmark noise, short and prolonged occlusion, and incorrect arm paths.
Use them to document behavior before any threshold tuning.
