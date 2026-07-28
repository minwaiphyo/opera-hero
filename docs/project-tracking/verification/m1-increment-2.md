# M1 Increment 2 Verification

Date: 2026-07-26

Branch: `m1-camera-lab`

## Scope

This increment implements headless camera-stream ownership. It deliberately does not
connect the service to React, enumerate cameras, remember a preferred device, display
a live preview, or perform automatic recovery.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Browser camera boundary | [`mediaDevicesPort.ts`](../../../src/camera/mediaDevicesPort.ts), [`browserMediaDevices.ts`](../../../src/camera/browserMediaDevices.ts) | [`browserMediaDevices.test.ts`](../../../src/camera/browserMediaDevices.test.ts) |
| Single-stream lifecycle service | [`cameraService.ts`](../../../src/camera/cameraService.ts) | [`cameraService.test.ts`](../../../src/camera/cameraService.test.ts) |
| Service-level typed failure | [`cameraErrors.ts`](../../../src/camera/cameraErrors.ts), [`cameraTypes.ts`](../../../src/camera/cameraTypes.ts) | [`cameraErrors.test.ts`](../../../src/camera/cameraErrors.test.ts) |

## Lifecycle guarantees verified

- At most one pending or active stream is owned by the service.
- Simultaneous start calls share the same camera request.
- Starting while active returns the active session.
- Stop releases every media track and is safe to repeat.
- Restart releases the old session before starting the next one.
- Restart during a pending request creates a fresh request.
- A stale request resolving after stop or restart is immediately stopped.
- Browser exceptions become safe application failures.
- An ended track transitions the service to `interrupted`.
- One faulty subscriber cannot prevent other subscribers from receiving events.
- Unsubscription works.
- Disposal releases the stream, clears observers, and prevents future starts.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M1-006 | Strict TypeScript check | Passed |
| EV-M1-007 | ESLint analysis | Passed |
| EV-M1-008 | Unit suite | Passed: 35 tests across 7 files |
| EV-M1-009 | Production build | Passed |
| EV-M1-010 | Existing Chrome smoke suite | Passed: 2 tests |

## Manual review boundary

There is no new live-camera interaction to test in this increment. Manual review
should confirm that the M1 page states “Increment 2 implemented,” explains that the
service is not connected to the page, and preserves navigation back to M0.

Live hardware verification begins after the service is connected to the laboratory
interface in Increment 4.
