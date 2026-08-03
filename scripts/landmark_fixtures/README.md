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

## Tests

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s scripts/tests -v
```

The tests verify edge trimming, no-motion fallback, timestamp rebasing, provenance,
and preservation of stationary pauses inside a gesture.
