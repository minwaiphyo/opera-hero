# M3 Orchid Finger Movement Completeness Increment 27

## Change

Orchid Finger now measures robust start-to-finish displacement of the left/right
elbows, wrists, and available palms against the three-take practitioner reference.
Median start/end windows reject isolated landmark drift. Overall similarity combines
the existing dynamic time warping and finger-shape score with tracking coverage and
movement completeness.

- A stationary visible hand pose has zero movement completeness.
- Reduced-range arm and palm paths receive a proportional penalty.
- Finger extension, curl, and thumb-to-fingertip scoring remain independent.
- Missing hand landmarks remain missing evidence rather than automatic failure.
- The live panel displays movement completeness separately.
- After the protected 15.6-second cycle, stationary completion tolerates isolated
  hand-jitter spikes shorter than one second and does not require prior movement.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-144 | Stationary held-pose rejection | Passed |
| EV-M3-145 | Reduced-range penalty | Passed |
| EV-M3-146 | Existing evaluator regression behavior | Passed |
| EV-M3-147 | Full unit and component suite | Passed: 235 tests across 54 files |
| EV-M3-148 | TypeScript, ESLint, and production build | Passed |

## Physical review

Run one stationary Orchid Finger attempt and one sincere complete attempt. Record
overall similarity and movement completeness for both. Confirm the stationary
attempt completes near the first 15.6-second reference boundary rather than the
30-second safety timeout.

**Result:** Passed on Chrome / Target A.

| Attempt | Overall similarity | Movement completeness | Elapsed | Automatic completion |
|---|---:|---:|---:|---|
| Stationary | 2.2% | 2.7% | 15.6 s | Passed |
| Sincere | 73.2% | 100.0% | 15.6 s | Passed |

The robust endpoint measure rejects stationary landmark drift while retaining full
completeness for the sincere movement. Neither attempt completed before the first
reference cycle or waited for the 30-second safety timeout. These results validate
the defect fix but do not establish a final visitor pass threshold.
