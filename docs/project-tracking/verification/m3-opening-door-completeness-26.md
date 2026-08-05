# M3 Opening Door Movement Completeness Increment 26

## Change

Opening Door now measures total left/right elbow and wrist path range against the
practitioner reference. Overall similarity is the existing soft dynamic time
warping score multiplied by tracking coverage and movement completeness.

- A stationary pose has zero movement completeness and overall score.
- Reduced-range arm paths receive a proportional penalty.
- Optional missing hand evidence does not invalidate a well-tracked arm path.
- The live panel displays movement completeness separately.
- After the protected 8.7-second cycle, stationary completion ignores isolated
  pose-jitter spikes shorter than 300 ms and does not require prior movement.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-138 | Stationary held-pose rejection | Passed |
| EV-M3-139 | Reduced-range penalty | Passed |
| EV-M3-140 | Existing evaluator regression behavior | Passed |
| EV-M3-141 | Full unit and component suite | Passed: 232 tests across 54 files |
| EV-M3-142 | TypeScript, ESLint, and production build | Passed |

## Physical review

Run one stationary Opening Door attempt and one sincere complete attempt. Record
overall similarity and movement completeness for both. Confirm the stationary
attempt completes near the first-cycle boundary rather than the 20-second timeout.

**Result:** Passed on Chrome / Target A.

| Attempt | Overall similarity | Movement completeness | Elapsed | Automatic completion |
|---|---:|---:|---:|---|
| Stationary | 2.2% | 4.3% | 8.8 s | Passed |
| Sincere | 72.9% | 100.0% | 8.7 s | Passed |

The stationary and sincere attempts are strongly separated, and neither completed
before the protected 8.7-second reference cycle or waited for the 20-second safety
timeout. These observations validate the reported defect fix; they do not establish
a final visitor pass threshold.
