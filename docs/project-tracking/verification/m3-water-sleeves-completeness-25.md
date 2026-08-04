# M3 Water Sleeves Movement Completeness Increment 25

## Problem

A stationary, fully tracked visitor received 73.1% because tolerant pointwise
dynamic time warping could match a held pose against enough reference positions.
Tracking quality was being mistaken for movement completion.

## Change

The evaluator now measures the attempt's total left/right upper-arm angular range
and elbow-path range against the practitioner reference. Their average produces an
interpretable `movementCompleteness` factor. Overall similarity is the existing
soft temporal score multiplied by tracking coverage and movement completeness.

- A stationary pose has zero excursion and therefore zero overall score.
- Reduced-range movement receives a proportional penalty.
- Full-range movements retain the existing dynamic time warping comparison.
- The live result panel displays movement completeness independently from tracking.
- The live capture uses a Water Sleeves-specific 0.06 pose-motion threshold after
  the protected first cycle, reducing final-hold delay caused by pose jitter.
- The protected first cycle replaces the old movement-arming requirement for Water
  Sleeves. A stationary attempt may finish after 7.7 seconds, and isolated pose
  jitter shorter than 300 ms does not reset the stillness timer.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-132 | Stationary held-pose rejection | Passed |
| EV-M3-133 | Reduced-range penalty | Passed |
| EV-M3-134 | Existing evaluator regression behavior | Passed |
| EV-M3-135 | Full unit and component suite | Passed: 230 tests across 54 files |
| EV-M3-136 | TypeScript, ESLint, and production build | Passed |

## Physical review

Run one Water Sleeves attempt while standing still, then one sincere complete
attempt. Record both overall similarity and movement completeness. The held pose
must score substantially below the earlier 73.1%; the sincere attempt should
remain meaningfully higher. This is a discrimination check, not final calibration.

**Result:** Passed for the reported defect on Chrome / Target A. The stationary
attempt fell from 73.1% to 8.3%. The project owner also confirmed that, after the
protected first cycle, jitter-tolerant stationary completion works without waiting
for the 20-second safety timeout. Comparative multi-attempt threshold tuning remains
future work and is not claimed as completed calibration.
