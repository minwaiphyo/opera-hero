# M1 Increment 5 Verification

Date: 2026-07-28

Branch: `m1-camera-lab`

## Scope

This increment adds a static visitor-positioning guide, explicit aspect-ratio
diagnostics, and bounded camera recovery. The guide communicates the intended
head, shoulder, arm, and hand area without claiming landmark detection. Actual
framing classification remains part of M2.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Bounded recovery policy | [`cameraRecovery.ts`](../../../src/camera/cameraRecovery.ts) | [`cameraRecovery.test.ts`](../../../src/camera/cameraRecovery.test.ts) |
| Recovery orchestration and cleanup | [`useCameraLab.ts`](../../../src/labs/camera/useCameraLab.ts) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx) |
| Recovery status and manual actions | [`CameraControls.tsx`](../../../src/labs/camera/CameraControls.tsx) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx) |
| Static visitor-positioning guide | [`CameraPreview.tsx`](../../../src/labs/camera/CameraPreview.tsx), [`cameraLab.css`](../../../src/labs/camera/cameraLab.css) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx) |
| Delivered aspect-ratio reporting | [`CameraDiagnostics.tsx`](../../../src/labs/camera/CameraDiagnostics.tsx) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx) |

## Guarantees verified automatically

- Recoverable failures schedule at most two attempts, with increasing delays.
- Permission denial and insecure-context failures never retry automatically.
- A successful recovery resets the retry budget.
- A pending recovery timer can be cancelled.
- Recovery timers are cleared when stopping or leaving the page.
- A manual **Retry now** action remains available after failure.
- The active preview displays the positioning guide.
- Delivered dimensions are reduced to a recognizable aspect ratio such as `16:9`.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M1-022 | Strict TypeScript check | Passed |
| EV-M1-023 | ESLint analysis | Passed |
| EV-M1-024 | Unit and component suite | Passed: 63 tests across 12 files |
| EV-M1-025 | Production build | Passed |
| EV-M1-026 | Chrome smoke suite | Passed: 2 tests |

## Manual verification required

1. Start the camera and confirm the positioning guide is visible without hiding
   the visitor.
2. Stand at approximately 1–2 metres and confirm head, shoulders, arms, and hands
   can fit within the guide.
3. Confirm **Aspect ratio** reports `16:9` for a 1280 × 720 stream, or the correct
   ratio for the delivered dimensions.
4. Stop and restart the camera and confirm the guide disappears and returns with
   the stream.
5. Temporarily block camera permission in Chrome, refresh, select **Start camera**,
   and confirm a clear permission message appears without automatic retry.
6. Restore camera permission and confirm **Retry now** or a refresh restores capture.

USB unplug/reconnect recovery remains part of Increment 6 because the exhibition
USB camera is not yet available.
