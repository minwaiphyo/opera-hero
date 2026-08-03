# M3 Practitioner Fixture Batch Increment 3 Verification

## Scope

This increment defines and extracts a curated first batch of front-facing practitioner
references for Opening Door, Orchid Finger, and Water Sleeves. Generated JSON remains
under ignored `local-artifacts/`; only the reproducible manifest and tooling are committed.

## Reference roles

- `primary`: normal-speed, front-facing scoring candidate.
- `diagnostic`: slow take used to inspect landmarks and movement structure.
- `supporting`: useful comparison that is not an initial scoring template.
- Half-left and half-right recordings are intentionally deferred because the booth
  camera is expected to be front-facing.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-014 | Python unit tests | Passed: 7 tests, including manifest validation and report generation |
| EV-M3-015 | TypeScript check | Passed |
| EV-M3-016 | ESLint | Passed |
| EV-M3-017 | Curated batch extraction | Passed: 9/9 fixtures generated with sustained motion detected |

## Manual review checklist

Use the M2 Landmark Laboratory to load each file from
`local-artifacts/landmark-fixtures/`. Record the result in the locally generated
`batch-report.md`.

- [x] Opening Door normal take 1
- [x] Opening Door normal take 2
- [x] Opening Door slow pilot
- [x] Orchid Finger normal take 1
- [x] Orchid Finger normal take 2
- [x] Orchid Finger normal take 3
- [x] Orchid Finger slow
- [x] Water Sleeves front view with sleeves
- [x] Water Sleeves front view without sleeves

For every fixture, confirm that the movement boundaries are intact, pose and hands
track the performer, severe landmark jumps or persistent hand swaps are absent, and
the complete gesture is retained.

Project-owner visual QA passed all nine fixtures. In the Water Sleeves reference with
sleeves, hands are covered and no hand landmarks are detected, as expected. In the
supporting reference without sleeves, one hand is absent for most of the sequence.
Water Sleeves scoring must therefore require pose/arm signals only; hand landmarks
are optional evidence and missing hands must not lower the score.

## Next increment

Derive a small normalized feature representation for scoring rather than committing
the large raw landmark replay files. Feature availability must be gesture-specific:
Water Sleeves uses pose/arm motion, while hand detail remains available for gestures
whose approved references track it reliably.
