# M3 First Reference Cycle Protection Increment 24

## Policy

Automatic completion and safety timeouts must not end an attempt before the first
complete reference cycle. Manual finish and cancel remain available developer
controls.

| Gesture | Protected minimum | Safety maximum | Sample limit |
|---|---:|---:|---:|
| Water Sleeves | 7.7 s | 20 s | 900 |
| Opening Door | 8.7 s | 20 s | 900 |
| Orchid Finger | 15.6 s | 30 s | 1,200 |

The sample limits exceed one complete cycle even at 60 worker frames per second,
so frame rate cannot undermine the time-based guarantee.

## Automated evidence

| Evidence | Check | Result |
|---|---|---|
| EV-M3-126 | Per-gesture minimum-duration configuration | Passed |
| EV-M3-127 | High-rate sample-buffer protection | Passed |
| EV-M3-128 | Focused capture and live-hook suite | Passed: 13 tests across 4 files |
| EV-M3-129 | Full unit and component suite | Passed: 227 tests across 54 files |
| EV-M3-130 | TypeScript, ESLint, and production build | Passed |

## Physical review

For Water Sleeves and Opening Door, start an attempt and remain stationary after
recording begins. Confirm neither attempt ends before its reference completes one
cycle. Then perform the movement and confirm automatic completion remains usable.
Orchid Finger already passed the equivalent physical behavior in EV-M3-125.

**Result:** Passed on Chrome / Target A. The project owner confirmed the minimum
duration works for Water Sleeves and Opening Door. Together with the earlier
Orchid Finger approval, all three first-cycle protections are physically verified.
