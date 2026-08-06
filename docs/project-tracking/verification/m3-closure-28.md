# M3 Gesture Scoring Laboratory Closure — Increment 28

## Outcome

M3 is complete. Opera Hero has transparent, image-free scoring foundations and
live developer flows for Water Sleeves, Opening Door, and Orchid Finger. Each uses
normalized landmarks, dynamic time warping, tracking coverage, movement
completeness, a practitioner reference guide, and bounded automatic capture.

## Physical discrimination summary

| Gesture | Stationary | Sincere | Other evidence | Capture boundary |
|---|---:|---:|---|---|
| Water Sleeves | 8.3% | 81.6–85.9% before completeness refinement | Partial 48.6–67.0%; incorrect 42.4–54.6% | First 7.7 s protected; stationary completion approved |
| Opening Door | 2.2% / 4.3% completeness | 72.9% / 100% completeness | Normal and slower live flows approved; deterministic displaced/reduced paths | First 8.7 s protected; 8.7–8.8 s observed |
| Orchid Finger | 2.2% / 2.7% completeness | 73.2% / 100% completeness | Deterministic wrong finger shape, reduced path, and slower timing | First 15.6 s protected; 15.6 s observed |

Scores are developer observations, not population estimates. The Water Sleeves
correct/partial/incorrect results predate the final movement-completeness factor and
remain directional evidence rather than final thresholds.

## Final automated gates

| Evidence | Gate | Result |
|---|---|---|
| EV-M3-150 | Vitest | Passed: 235 tests across 54 files |
| EV-M3-151 | TypeScript, ESLint, production build | Passed |
| EV-M3-152 | Playwright Chrome smoke suite | Passed: 3 tests |
| EV-M3-153 | Python fixture suite | Passed: 7 tests |
| EV-M3-154 | Three-gesture physical matrix | Passed with documented limitations |
| EV-M3-155 | Scope and evidence audit | Passed |

## Known limitations carried forward

- References come from one practitioner; conservative multi-person participant
  calibration was not feasible before the festival.
- No visitor pass/fail threshold is approved. M4 should consume soft similarity and
  use encouraging, lenient progression until festival observations support tuning.
- Physical discrimination for Opening Door and Orchid Finger covers sincere and
  stationary attempts; broader partial/incorrect checks remain desirable but are
  not a prerequisite for the gameplay-state simulator.
- Water Sleeves hand landmarks are unreliable under sleeves, so its scoring relies
  on pose/arm evidence by design.
- The integrated laptop is the current Target A. The eventual exhibition laptop,
  external webcam, television geometry, lighting, and visitor distance require
  deployment validation in M9–M10.
- The production build retains MediaPipe WebAssembly resolution warnings and a
  roughly 1.29 MB application chunk. Performance is acceptable on Target A, but
  code splitting remains a kiosk-hardening opportunity.
- Automated browser smoke tests do not grant real camera permission; physical
  camera and landmark behavior is represented by the recorded manual evidence.

## Handoff to M4

M4 should treat each evaluator as a domain service returning soft similarity,
tracking status, and movement completeness. The gameplay state machine must remain
independent from MediaPipe and must support attract, instructions, demonstration,
countdown, attempt, positive feedback, transition, completion, abandonment, and
bounded reset paths.
