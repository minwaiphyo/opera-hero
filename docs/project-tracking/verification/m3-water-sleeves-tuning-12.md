# M3 Water Sleeves Tuning Increment 12 Verification

## Scope

This increment records labelled live scores in browser memory and evaluates whether
observed correct and incorrect attempts separate. It does not modify evaluator
tolerances, persist visitor data, or adopt a production threshold automatically.

## Behavior

- Label the latest completed attempt as correct, partial, or incorrect.
- Relabel an attempt without duplicating it.
- Exclude attempts with insufficient tracking from tuning calculations.
- Display counts and score ranges for each label.
- Report overlap instead of inventing a threshold.
- Show a candidate midpoint only when the highest incorrect score is below the
  lowest correct score.
- Require at least three usable correct and three usable incorrect attempts before
  marking the candidate ready for human review.
- Keep all observations in page memory only; refreshing clears the session.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-063 | Tuning-analysis unit tests | Passed |
| EV-M3-064 | Tuning-session component tests | Passed |
| EV-M3-065 | Full unit and component suite | Passed: 173 tests across 37 files |
| EV-M3-066 | TypeScript, ESLint, and production build | Passed |
| EV-M3-067 | Browser smoke suite | Passed: 3 tests |

## Physical verification protocol

Use the same camera position and remain approximately 1–2 metres away.

1. Perform three sincere Water Sleeves attempts while following the guide. Label
   each `Correct`.
2. Perform three partial attempts, such as stopping halfway or using only one arm.
   Label each `Partial`.
3. Perform three deliberately incorrect but fully tracked movements, such as moving
   both arms along a different path. Label each `Incorrect`.
4. Do not label random absence or severe tracking loss as incorrect; those are
   tracking failures, not movement negatives.
5. Record the three displayed score ranges, separation result, candidate midpoint
   if any, and any attempt whose result appears surprising.

## Interpretation gate

- `Separated`: a provisional candidate can be reviewed, but is not adopted yet.
- `Overlap`: inspect per-signal scores and revise features or tolerances; do not force
  a threshold between overlapping classes.
- `Insufficient data`: collect the missing usable labels.

## Next step

Use the physical results to decide whether Water Sleeves needs no change, a
conservative tolerance adjustment, or a feature-level correction. Any adopted
parameter must receive deterministic regression coverage in a separate commit.
