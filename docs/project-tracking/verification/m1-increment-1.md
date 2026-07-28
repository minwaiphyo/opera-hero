# M1 Increment 1 Verification

Date: 2026-07-26

Branch: `m1-camera-lab`

## Scope

This increment establishes camera-domain contracts and navigation only. It does not
open, own, stop, restart, enumerate, or recover a live camera stream.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Camera lifecycle and event vocabulary | [`cameraTypes.ts`](../../../src/camera/cameraTypes.ts) | Compile-time exhaustiveness and dependent unit tests |
| Browser camera error normalization | [`cameraErrors.ts`](../../../src/camera/cameraErrors.ts) | [`cameraErrors.test.ts`](../../../src/camera/cameraErrors.test.ts) |
| Validated video-only capture request | [`cameraConstraints.ts`](../../../src/camera/cameraConstraints.ts) | [`cameraConstraints.test.ts`](../../../src/camera/cameraConstraints.test.ts) |
| M0/M1 development navigation | [`DevelopmentNav.tsx`](../../../src/app/DevelopmentNav.tsx), [`routes.ts`](../../../src/app/routes.ts), [`CameraLabPage.tsx`](../../../src/labs/camera/CameraLabPage.tsx) | [`routes.test.ts`](../../../src/app/routes.test.ts), [`baseline.spec.ts`](../../../tests/e2e/baseline.spec.ts) |

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M1-001 | Strict TypeScript check | Passed |
| EV-M1-002 | ESLint analysis | Passed |
| EV-M1-003 | Unit suite | Passed: 20 tests across 5 files |
| EV-M1-004 | Production build | Passed |
| EV-M1-005 | Chrome navigation smoke suite | Passed: 2 tests |

## Boundary preserved

The following remain intentionally unimplemented:

- camera stream lifecycle service;
- live M1 preview;
- device enumeration and USB-camera selection;
- camera preferences;
- frame metrics;
- framing overlay;
- recovery policy.

These are reserved for later M1 increments so this commit remains independently
reversible.
