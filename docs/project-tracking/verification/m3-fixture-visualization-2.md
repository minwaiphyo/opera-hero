# M3 Fixture Visualization Increment 2 Verification

## Scope

This increment lets developers load a generated landmark fixture directly from disk
into the existing M2 replay laboratory. The file stays local, is validated before
use, and is not copied into application storage or the repository.

## Implementation

- Local JSON file input in `/lab/landmarks`.
- Existing `parseVisionReplayFixture` validation before replay.
- Clear invalid-JSON and invalid-contract feedback without replacing the active
  fixture.
- Reuse of the existing replay adapter, clock, pose/hand canvas, and playback-speed
  controls.
- Practitioner metadata display: source file, duration, retained range, sample rate,
  motion detection, padding, and frame count.
- Switching back to either built-in synthetic fixture remains available.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-007 | Focused component tests | Passed: valid local load and invalid JSON recovery |
| EV-M3-008 | Full Vitest suite | Passed: 121 tests across 24 files |
| EV-M3-009 | TypeScript and ESLint | Passed |
| EV-M3-010 | Production build | Passed |
| EV-M3-011 | Existing browser smoke suite | Passed: 3 tests |

## Real-fixture evidence

The ignored `local-artifacts/landmark-fixtures/opening-door-slow.fixture.json` pilot
was loaded in Chrome.

- JSON size: approximately 4 MB.
- Frames replayed: 156 of 156.
- Duration: 7767 ms.
- Pose and both hands rendered visibly through completion.
- Mid-replay diagnostics reported good framing, two hands, and approximately 99.8%
  tracking quality.
- Displayed source and trim metadata matched the Python extraction output.

## Manual review checklist

- [x] Open `/lab/landmarks`.
- [x] Choose `local-artifacts/landmark-fixtures/opening-door-slow.fixture.json` under
  **Load local fixture JSON**.
- [x] Confirm `Local · opening-door-slow-pilot` is selected.
- [x] Play and confirm the complete gesture and landmarks are visible.
- [x] Confirm the beginning, ending, and internal timing look acceptable.

Project owner confirmed the pilot fixture looked correct in the laboratory on
2026-08-03. Playback-control and built-in-fixture regression behavior remain covered
by the automated component suite.

## Next increment

After project-owner approval of the slow Opening Door replay, generate and inspect
the two normal front-facing Opening Door takes. Then select which takes become
canonical scoring references.
