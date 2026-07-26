# M1 Increment 4 Verification

Date: 2026-07-26

Branch: `m1-camera-lab`

## Scope

This increment connects the tested camera lifecycle and device-catalog services to a
real Camera Laboratory interface. It adds a mirrored local preview, source selection,
explicit lifecycle controls, and live stream diagnostics. It does not yet implement
visitor framing guidance, health metrics, or bounded automatic recovery.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Browser runtime composition | [`cameraLabRuntime.ts`](../../../src/labs/camera/cameraLabRuntime.ts) | Exercised through the page and existing camera-service tests |
| React lifecycle adapter | [`useCameraLab.ts`](../../../src/labs/camera/useCameraLab.ts) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx) |
| Mirrored local camera preview | [`CameraPreview.tsx`](../../../src/labs/camera/CameraPreview.tsx) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx) |
| Camera source and stream controls | [`CameraControls.tsx`](../../../src/labs/camera/CameraControls.tsx) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx) |
| Requested and delivered stream diagnostics | [`CameraDiagnostics.tsx`](../../../src/labs/camera/CameraDiagnostics.tsx) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx) |
| Camera laboratory page and layout | [`CameraLabPage.tsx`](../../../src/labs/camera/CameraLabPage.tsx), [`cameraLab.css`](../../../src/labs/camera/cameraLab.css), [`App.tsx`](../../../src/app/App.tsx) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx), [`baseline.spec.ts`](../../../tests/e2e/baseline.spec.ts) |

## Guarantees verified automatically

- The page loads enumerated cameras and displays their labels.
- Starting capture binds the resulting stream to the preview.
- The requested and browser-delivered resolution and frame rate are visible.
- Stopping capture returns the UI to its idle state.
- Selecting a camera while idle saves the preference without opening the camera.
- Selecting a camera while active restarts capture with the new device.
- Unmounting the laboratory disposes the stream, catalog observer, and subscriptions.
- Browser smoke coverage reaches both the M0 and M1 pages.
- The page states that frames are neither recorded nor uploaded.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M1-016 | Strict TypeScript check | Passed |
| EV-M1-017 | ESLint analysis | Passed |
| EV-M1-018 | Unit suite | Passed: 58 tests across 11 files |
| EV-M1-019 | Production build | Passed |
| EV-M1-020 | Chrome smoke suite | Passed: 2 tests |

## Manual verification required

Physical-camera behavior must be checked on Target A before this increment is
committed:

1. Open `/lab/camera` in Chrome and confirm the integrated camera appears.
2. Select **Start camera**, allow access if prompted, and confirm a mirrored preview.
3. Confirm the delivered resolution and frame rate are populated.
4. Select **Restart** and confirm capture resumes without a stuck camera indicator.
5. Select **Stop** and confirm both the preview and Windows camera indicator stop.
6. Start again, navigate to M0, and confirm the camera indicator stops.
7. If more than one camera is connected, switch sources while live and confirm the
   preview changes.

Record the manual result in the development ledger after review.
