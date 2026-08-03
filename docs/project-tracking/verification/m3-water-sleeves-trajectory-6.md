# M3 Water Sleeves Temporal Trajectory Increment 6 Verification

## Scope

This increment converts an approved Water Sleeves replay into normalized temporal
samples and reports per-signal availability across the complete sequence. It recommends
signal use conservatively but does not create similarity tolerances or a pass threshold.

## Policy

- Sample progress is normalized from `0` to `1`, independently of video duration.
- Upper-arm angles and normalized elbow positions may be `required` at 90% coverage.
- Signals below 90% but at or above 50% are `optional`; lower coverage is `excluded`.
- Wrist positions and elbow angles can never be automatically required, even at 100%
  coverage, because pose availability does not prove accuracy under fabric occlusion.
- MediaPipe Hand Landmarker detections are not part of Water Sleeves coverage.

## Evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-029 | Trajectory unit tests | Passed: normalized progress, coverage, missing frames, and conservative signal recommendations |
| EV-M3-030 | Full unit and component suite | Passed |
| EV-M3-031 | Strict TypeScript check and ESLint | Passed |
| EV-M3-032 | Production build | Passed |
| EV-M3-033 | Real with-sleeves coverage | Passed: all 155 frames usable; core pose coverage 92.9–100%; wrist and elbow-angle signals remained optional |
| EV-M3-034 | Real without-sleeves coverage | Passed: all 145 frames usable; pose signals at 100%; wrist and elbow-angle signals remained optional |

## Manual verification

- [ ] Load both Water Sleeves fixtures and compare the Sequence coverage table.
- [ ] Confirm upper-arm and elbow-position signals are marked `required`.
- [ ] Confirm wrist and elbow-angle signals remain `optional` at high coverage.
- [ ] Confirm the copy states that coverage measures availability, not correctness.
- [ ] Confirm the missing Hand Landmarker detection does not lower pose coverage.

## Next increment

Create a compact Water Sleeves reference trajectory from the approved with-sleeves
fixture, resample it onto consistent progress points, and define broad per-feature
tolerance bands. Validate the envelope against the supporting no-sleeves reference
before applying it to live visitors.
