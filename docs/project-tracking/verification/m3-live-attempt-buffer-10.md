# M3 Live Water Sleeves Attempt Buffer Increment 10 Verification

## Scope

This increment adds a framework-independent buffer between live landmark frames and
the existing Water Sleeves trajectory evaluator. It does not yet change the camera or
laboratory interface.

## Behavior

- Explicit `start`, `finish`, `cancel`, and `reset` lifecycle.
- Ignore frames before at least one usable pose arm is available.
- Retain compact normalized arm features only; never retain video, image frames, raw
  pose arrays, or hand arrays.
- Preserve tracking gaps after capture starts so evaluator coverage remains honest.
- Classify current capture tracking as awaiting, tracked, grace, or lost.
- Recover when usable tracking returns after a short or long gap.
- Finalize at a 12-second default duration or 300-sample hard bound.
- Reject concurrent attempts and non-monotonic frame timestamps.
- Produce the same `WaterSleevesTrajectory` contract used by fixture replay scoring.

## Evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-053 | Live attempt-buffer unit tests | Passed: seven lifecycle, tracking, bounded-memory, timestamp, and validation cases |
| EV-M3-054 | Shared trajectory regression tests | Passed |
| EV-M3-055 | Full unit and component suite | Passed |
| EV-M3-056 | Strict TypeScript check and ESLint | Passed |
| EV-M3-057 | Production build | Passed |

## Manual verification

No physical-camera verification is required for this framework-independent increment.
The live scoring laboratory in the next increment will provide start, finish, cancel,
reset, tracking-state, buffer-size, and completed-score controls for manual testing.

## Next increment

Connect the attempt buffer to the existing worker-owned live landmark stream in a
developer-only Water Sleeves scoring laboratory. Score a completed attempt with the
committed reference and retain it for deterministic replay.
