# M3 Fixture Extraction Increment 1 Verification

## Scope

This increment creates a development-only Python path from a cleaned practitioner
video to the existing landmark replay format. It automatically trims only leading
and trailing inactivity, retaining internal stationary pauses and 400 ms of context
around detected movement.

## Implementation

- MediaPipe Pose Lite and Hand Landmarker video inference at a configurable sample
  rate, defaulting to 20 FPS.
- Browser-compatible normalized pose and hand landmark JSON.
- Body-scale-normalized motion energy using shoulders, elbows, wrists, and hands.
- Sustained-motion edge detection, smoothing, padding, and full-sequence fallback.
- Practitioner extraction metadata validated by the TypeScript replay boundary.
- Source frames are never copied into generated fixtures.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-001 | Python unit tests | Passed: 4 tests, including internal-pause preservation |
| EV-M3-002 | Slow Opening Door extraction | Passed: 156 frames generated from an 8267 ms source; retained 0–7767 ms |
| EV-M3-003 | Full Vitest suite | Passed: 119 tests across 24 files |
| EV-M3-004 | TypeScript check | Passed |
| EV-M3-005 | ESLint | Passed |
| EV-M3-006 | Production build | Passed |

The pilot output is under ignored `local-artifacts/landmark-fixtures/` and is not part
of this commit. `test-results/` must not be used because Playwright clears it.

## Manual review checklist

- [ ] Run the pilot command in
  [`scripts/landmark_fixtures/README.md`](../../../scripts/landmark_fixtures/README.md).
- [ ] Confirm the command reports 156 frames and approximately `0–7767 ms` for the
  current slow Opening Door file.
- [ ] Open the output JSON and confirm `sourceFile`, source duration, and trim bounds.
- [ ] Compare those bounds with the source video; record whether the retained start
  and finish context look appropriate.
- [ ] Confirm practitioner footage and `.venv` do not appear in `git status`.

## Known limits

- Edge defaults are provisional and must be visually reviewed across movements.
- This increment does not add generated references to the replay laboratory.
- It does not remove or compress internal pauses.
- MediaPipe emits harmless local diagnostic warnings during offline extraction.

## Next increment

Load the pilot fixture in the landmark laboratory for visual playback, then adjust
edge thresholds only if the rendered sequence shows incorrect boundaries.
