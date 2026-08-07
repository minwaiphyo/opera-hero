# Practitioner Landmark Fixture Extraction

This development-only Python tool converts a cleaned practitioner video into the
normalized JSON replay format used by Opera Hero. It trims only stationary footage
at the outer edges. Internal pauses remain in the reference sequence.

## Local setup

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-fixtures.txt
```

The current project workspace already has an ignored `.venv`. Python and these
packages are not needed by the festival booth runtime.

## Pilot command

```powershell
.\.venv\Scripts\python.exe scripts\extract_landmark_fixture.py `
  --input "docs\practitioner-footage\cleaned\OpeningDoor\OpeningDoorSlowedPace.mp4" `
  --output "local-artifacts\landmark-fixtures\opening-door-slow.fixture.json" `
  --id "opening-door-slow-pilot" `
  --description "Opening Door slow practitioner reference pilot"
```

The default extraction rate is 20 FPS. Motion must remain above the normalized
threshold for 250 ms to establish an active edge, and 400 ms of context is retained
around the detected movement. The JSON `extraction` block records the chosen source
range. Generated output under `local-artifacts/` is intentionally not committed.
Do not use `test-results/`; Playwright clears that directory when its suite starts.

## Curated practitioner batch

After confirming the pilot, extract the front-facing scoring candidates and supporting
references declared in `practitioner_fixture_manifest.json`:

```powershell
.\.venv\Scripts\python.exe scripts\extract_practitioner_fixture_batch.py
```

Existing outputs are reused. Pass `--force` to regenerate all of them, or repeat
`--only FIXTURE_ID` to run selected entries. The ignored output directory contains
one JSON file per reference and a `batch-report.md` checklist. Load each JSON into
the M2 Landmark Laboratory and mark its visual QA result in your local report.

The initial batch deliberately excludes half-left and half-right footage. Those
angles are diagnostic material, not scoring references for the front-facing booth.

## Water Sleeves compact reference

Regenerate the committed, landmark-derived Water Sleeves envelope from the approved
local fixture and compare the supporting no-sleeves take:

```powershell
node scripts\generate_water_sleeves_reference.mjs `
  --input "local-artifacts\landmark-fixtures\water-sleeves-front-with-sleeves.fixture.json" `
  --output "src\domain\gestures\references\waterSleeves.reference.json" `
  --compare "local-artifacts\landmark-fixtures\water-sleeves-front-without-sleeves.fixture.json"
```

The output contains 41 smoothed progress points, broad provisional tolerances, and
no recorded imagery. It is small enough to commit. The full landmark fixtures remain
ignored local development artifacts.

## Visitor guide videos

The game shows the visitor the movement before scoring it. Build those clips from the
same footage, on every machine that runs the booth:

```powershell
node scripts\build_practitioner_guides.mjs
```

This writes `public/guides/<gesture-id>.mp4` and a poster frame for each gesture. Each
clip is cut from the primary take named in `practitioner_fixture_manifest.json` and
trimmed to the length of the committed reference guide in
`src/domain/gestures/references/`, so the visitor watches the same performance, over the
same window, that the evaluator compares them against. The script reads that length from
the reference itself and fails if a clip cannot match it — regenerate the guides whenever
a reference is regenerated.

Like the footage they are cut from, the videos are recorded practitioner imagery and are
not committed. Until they are built the game falls back to a framed gesture glyph and
stays playable, and the browser console names the script to run.

## Tests

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s scripts/tests -v
```

The tests verify edge trimming, no-motion fallback, timestamp rebasing, provenance,
and preservation of stationary pauses inside a gesture.
