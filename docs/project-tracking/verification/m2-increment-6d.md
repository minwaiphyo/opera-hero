# M2 Increment 6D Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

## Scope

This subincrement removes the false landmark-model error shown during normal
camera startup. Frame capture now waits for the worker-confirmed `ready` state,
and the worker client defensively closes any frame submitted before readiness.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Worker readiness gate | [`visionWorkerClient.ts`](../../../src/vision/visionWorkerClient.ts) | [`visionWorkerClient.test.ts`](../../../src/vision/visionWorkerClient.test.ts) |
| Readiness-aware camera capture | [`useLandmarkOverlay.ts`](../../../src/labs/camera/useLandmarkOverlay.ts) | Worker-client regression suite and manual camera startup check |

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-045 | Strict TypeScript check | Passed |
| EV-M2-046 | ESLint analysis | Passed |
| EV-M2-047 | Unit and component suite | Passed: 113 tests across 23 files |
| EV-M2-048 | Production build and worker bundle | Passed |
| EV-M2-049 | M0/M1/M2 Chrome smoke suite | Passed: 3 tests |

## Manual verification checklist

- [ ] Start the M1 camera and confirm the badge stays at `Vision worker loading`
      while the models initialize.
- [ ] Confirm the badge changes directly to the tracking state without briefly
      showing `Vision worker failed`.
- [ ] Confirm pose and both hand overlays appear normally.
- [ ] Stop the camera during loading and confirm the preview stops without an
      error.
- [ ] Start the camera again and confirm initialization still succeeds.

## Status

Implementation and automated verification passed. Physical startup verification is
pending project-owner confirmation.
