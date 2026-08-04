# M3 Opening Door Features Increment 16 Verification

## Scope

This increment extracts normalized frame-level signals for the practitioner’s
Opening Door sequence. It does not build a temporal trajectory, reference envelope,
similarity evaluator, pass threshold, or live UI.

## Signals

- Left and right elbow position relative to the matching shoulder.
- Optional left and right wrist position relative to the matching shoulder.
- Optional elbow bend angle.
- Optional palm centre relative to the shoulder midpoint.
- Optional palm direction and scale-independent openness.
- Arm and hand availability counts for later coverage decisions.

## Design constraints

- Shoulder width normalizes body scale and distance from the camera.
- Feature coordinates are translation invariant and use upward-positive Y.
- Hands are associated with the nearest visible pose wrist instead of trusting
  reported handedness, which can be affected by mirroring conventions.
- Missing Hand Landmarker output does not discard usable pose-arm features.
- Missing pose wrists do not discard visible elbow paths.
- Hands farther than 1.5 shoulder widths from a pose wrist are not associated.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-083 | Opening Door feature unit tests | Passed: 5 tests |
| EV-M3-084 | Strict TypeScript and ESLint | Passed |
| EV-M3-085 | Full unit and component suite | Passed: 187 tests across 40 files |
| EV-M3-086 | Production build | Passed |

## Next step

Convert frame features into a normalized Opening Door temporal trajectory and
inspect coverage across the two normal practitioner takes before generating its
reference envelope.
