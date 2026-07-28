# M1 Increment 6 Verification

Date: 2026-07-28

Branch: `m1-camera-lab`

## Scope

This final M1 increment adds repeatable lifecycle-stress and long-running camera
stability measurements. It closes M1 on Target A after the one-hour physical soak
passes. The final exhibition computer and USB camera will receive a separate
hardware revalidation without reopening the camera architecture by default.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Stability metric calculation | [`cameraStability.ts`](../../../src/camera/cameraStability.ts) | [`cameraStability.test.ts`](../../../src/camera/cameraStability.test.ts) |
| Live one-hour soak monitor | [`CameraStabilityPanel.tsx`](../../../src/labs/camera/CameraStabilityPanel.tsx), [`CameraPreview.tsx`](../../../src/labs/camera/CameraPreview.tsx), [`CameraLabPage.tsx`](../../../src/labs/camera/CameraLabPage.tsx), [`cameraLab.css`](../../../src/labs/camera/cameraLab.css) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx), [`baseline.spec.ts`](../../../tests/e2e/baseline.spec.ts) |
| Repeated lifecycle stress | Existing [`cameraService.ts`](../../../src/camera/cameraService.ts) | [`cameraService.test.ts`](../../../src/camera/cameraService.test.ts) |

## Guarantees verified automatically

- Fifty consecutive start/stop cycles open fifty streams and close all one hundred
  fake tracks exactly once.
- Stability metrics calculate observed FPS, rendered and dropped frames, drop rate,
  stalled samples, and heap trend.
- The sample history is bounded to approximately one hour.
- The stability monitor resets for every new camera session.
- The monitor remains observational and never records camera frames.
- Both M0 and M1 remain reachable in the production browser smoke suite.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M1-028 | Strict TypeScript check | Passed |
| EV-M1-029 | ESLint analysis | Passed |
| EV-M1-030 | Unit and component suite | Passed: 66 tests across 13 files |
| EV-M1-031 | Production build | Passed |
| EV-M1-032 | Chrome smoke suite | Passed: 2 tests |

## Final Target A soak procedure

1. Connect the laptop to power and prevent Windows sleep for the test.
2. Open `/lab/camera` in Chrome and start the integrated camera.
3. Keep the M1 page visible and foregrounded for 60 minutes.
4. Do not minimize Chrome or switch tabs for long periods; Chrome throttling would
   invalidate the measurement.
5. At 60:00, record:
   - stability status;
   - delivered resolution, FPS, and aspect ratio;
   - observed FPS;
   - rendered and dropped frames;
   - drop rate;
   - stalled samples;
   - heap trend.
6. Confirm the preview remains live and responsive.
7. Stop the camera and confirm the Windows camera indicator turns off.

## Exit-gate interpretation

M1 can be marked complete on Target A when:

- the soak reaches 60:00 without a frozen preview or uncontrolled camera error;
- no persistent upward heap trend or material frame degradation is observed;
- the camera indicator turns off after the test;
- the measured values are added to the evidence log.

USB selection and physical unplug/reconnect must be repeated when the exhibition
camera arrives. Final mount distance, lighting, display, and computer checks remain
release-hardware obligations for M9–M10.
