# M3 Shared Gesture Scoring Contract Increment 15 Verification

## Scope

This increment defines the minimum common boundary needed for Water Sleeves,
Opening Door, and Orchid Finger to share orchestration and result presentation while
retaining gesture-specific features, references, and scoring logic.

## Contract

- Canonical typed IDs and level metadata for all three festival gestures.
- Shared tracking states: `good`, `limited`, and `insufficient`.
- Shared overall score, tracking coverage, aligned-pair count, and per-signal result
  shape.
- A typed scorer interface that accepts a gesture-specific attempt.
- Existing Water Sleeves evaluation conforms without changing calculations.

## Boundaries

- No universal gesture feature representation is introduced.
- No pass threshold is added.
- No Water Sleeves score behavior is changed.
- Opening Door and Orchid Finger remain free to define different required signals.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-079 | Shared contract and canonical metadata tests | Passed |
| EV-M3-080 | Existing Water Sleeves evaluator compatibility | Passed |
| EV-M3-081 | Full unit and component suite | Passed: 182 tests across 39 files |
| EV-M3-082 | TypeScript, ESLint, and production build | Passed |

## Next step

Implement normalized Opening Door frame features against this common result
contract.
