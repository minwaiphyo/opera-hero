# M3 Water Sleeves Reference Envelope Increment 7 Verification

## Scope

This increment derives a compact, image-free Water Sleeves reference from the approved
front-facing fixture with sleeves. It provides provisional developer comparisons but
does not yet define a visitor pass threshold.

## Design

- Resample the complete gesture onto 41 normalized progress points.
- Smooth each point over a local 2.5% progress window.
- Use circular averaging for angles and medians for elbow positions.
- Fill isolated required-signal gaps from the nearest observable pose-arm sample.
- Apply broad provisional tolerances of 30 degrees for upper-arm angles and 0.5
  shoulder widths for elbow positions.
- Commit only the 21 KB derived reference; retain multi-megabyte fixtures locally.
- Explicitly mark the reference as derived from recorded imagery while confirming it
  contains no recorded imagery.

## Evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-035 | Envelope unit tests | Passed: deterministic resampling, circular smoothing, tolerance comparison, and invalid point count |
| EV-M3-036 | Committed-reference tests | Passed: provenance, 41 points, and complete required targets |
| EV-M3-037 | Canonical with-sleeves comparison | Passed: 100% developer fit across all four required signals |
| EV-M3-038 | Supporting no-sleeves comparison | Observed: 80.5% overall; left angle 100%, right angle 73.2%, left elbow 82.9%, right elbow 65.9% |
| EV-M3-039 | Full unit and component suite | Passed |
| EV-M3-040 | TypeScript, ESLint, and production build | Passed |
| EV-M3-041 | Local browser envelope display | Passed: both real fixtures displayed the expected comparison and no browser errors occurred |

## Interpretation

The supporting take's 80.5% fixed-progress fit is evidence that the envelope is broad
without accepting every trajectory. It is not a participant calibration result and
must not become the public completion threshold. Differences on the right side also
show why the next evaluator needs temporal alignment rather than rigid frame matching.

## Manual verification

- [ ] Load the with-sleeves fixture and confirm `Overall fit` is 100%.
- [ ] Load the without-sleeves fixture and confirm `Overall fit` is approximately 80.5%.
- [ ] Confirm the panel labels this as a provisional developer comparison.
- [ ] Confirm both fixtures still replay normally.

## Next increment

Build reusable temporal alignment and soft per-feature membership scoring. Verify that
speed changes and short missing-signal intervals do not create artificial failure.
