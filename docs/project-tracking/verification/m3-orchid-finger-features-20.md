# M3 Orchid Finger Features Increment 20 Verification

## Scope

This increment extracts normalized frame-level signals for the practitioner’s
Orchid Finger sequence. It does not create a trajectory, reference envelope,
similarity evaluator, pass threshold, or live UI.

## Signals

- Left and right elbow/wrist placement relative to shoulder width.
- Left and right palm centre relative to the body.
- Palm direction in hand-local coordinates.
- Scale-independent extension for thumb, index, middle, ring, and pinky.
- Index, middle, ring, and pinky curl angles.
- Scale-independent thumb-to-index, middle, ring, and pinky fingertip distances.
- Arm and hand availability counts.

## Design constraints

- Shoulder width normalizes body placement and camera distance.
- Palm length normalizes finger shape independently of hand size and image scale.
- Hands are associated with the nearest visible pose wrist instead of trusting
  reported handedness.
- Missing hands retain usable arm-placement context but cannot provide finger-shape
  evidence.
- Individual finger relationships remain explicit and interpretable for later
  scoring and cultural review.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-105 | Orchid Finger normalization tests | Passed: 5 tests |
| EV-M3-106 | Finger-shape relationship tests | Passed |
| EV-M3-107 | Full unit and component suite | Passed: 206 tests across 47 files |
| EV-M3-108 | TypeScript, ESLint, and production build | Passed |

## Next step

Measure signal coverage across the three normal practitioner takes, build normalized
trajectories, and generate a compact multi-take reference envelope. Keep the slow
take diagnostic.
