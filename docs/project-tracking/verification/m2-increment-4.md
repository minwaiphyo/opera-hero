# M2 Increment 4 Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

## Scope

This increment makes the worker pipeline measurable in the live camera laboratory.
It adds bounded rolling latency and throughput statistics, surfaces scheduler
backpressure, and reports the actual worker delegate, pose variant, and pinned
MediaPipe runtime version.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Bounded rolling inference diagnostics | [`visionDiagnostics.ts`](../../../src/vision/visionDiagnostics.ts) | [`visionDiagnostics.test.ts`](../../../src/vision/visionDiagnostics.test.ts) |
| Worker runtime metadata | [`visionRuntime.ts`](../../../src/vision/visionRuntime.ts), [`visionWorkerProtocol.ts`](../../../src/vision/visionWorkerProtocol.ts), [`vision.worker.ts`](../../../src/vision/vision.worker.ts), [`visionWorkerClient.ts`](../../../src/vision/visionWorkerClient.ts) | [`visionWorkerProtocol.test.ts`](../../../src/vision/visionWorkerProtocol.test.ts), [`visionWorkerClient.test.ts`](../../../src/vision/visionWorkerClient.test.ts) |
| Live camera diagnostics panel | [`VisionDiagnosticsPanel.tsx`](../../../src/labs/camera/VisionDiagnosticsPanel.tsx), [`useLandmarkOverlay.ts`](../../../src/labs/camera/useLandmarkOverlay.ts), [`CameraPreview.tsx`](../../../src/labs/camera/CameraPreview.tsx), [`cameraLab.css`](../../../src/labs/camera/cameraLab.css) | [`VisionDiagnosticsPanel.test.tsx`](../../../src/labs/camera/VisionDiagnosticsPanel.test.tsx) |

## Metric definitions

- **Inference latest/p50/p95:** pose plus hand inference duration inside the worker.
- **Capture p50/p95:** camera capture timestamp to normalized worker result.
- **Effective rate:** completed landmark frames per second over the rolling window.
- **Completed/submitted:** results rendered versus frames accepted by the scheduler.
- **Replaced:** waiting frames discarded when a newer frame supersedes them.
- **Replacement rate:** replaced frames divided by submitted frames.
- **Queue:** whether one frame is active and whether one newest frame is pending.

Timing percentiles and effective rate use only the latest 120 completed frames.
Lifetime counts remain numeric counters and do not retain frame data. React receives
diagnostic UI updates at most four times per second even though every completed
frame contributes to the rolling calculation.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-018 | Strict TypeScript check | Passed |
| EV-M2-019 | ESLint analysis | Passed |
| EV-M2-020 | Unit and component suite | Passed: 91 tests across 19 files |
| EV-M2-021 | Production build and worker bundle | Passed |
| EV-M2-022 | Existing Chrome smoke suite | Passed: 2 tests |
| EV-M2-023 | 30-second Target A diagnostics review | Passed: live metrics populated; performance target requires longer validation |

## Manual physical-camera checklist

Completed by the project owner on Target A:

1. Worker badge reported GPU and Pose Lite.
2. Runtime and live performance metrics populated.
3. Completed/submitted counts increased during approximately 30 seconds of
   continuous movement.
4. Backpressure replaced stale frames while the live overlays continued working.

### Observed Target A measurements

| Metric | Result |
|---|---:|
| Effective inference rate | 20.4 FPS |
| Inference p50 | 43.9 ms |
| Inference p95 | 76.1 ms |
| Capture-to-result p50 | 62.9 ms |
| Capture-to-result p95 | 100.6 ms |
| Replaced frames | 403 |
| Replacement rate | 44.4% |

The 100.6 ms capture-to-result p95 is 0.6 ms above the provisional `<100 ms`
architecture target. This short run proves measurement and bounded backpressure,
but it does not pass the M2 latency exit gate. Reassess with a longer representative
run after framing/tracking work and any pipeline tuning.

## Known limitations

- The short-run capture-to-result p95 is marginally above the provisional target;
  a representative long-run measurement remains required.
- Tracking quality and framing classifications belong to the next increment.
- The diagnostics panel is a development laboratory surface, not final visitor UI.
- The MediaPipe-generated module loader produces two non-fatal Vite build warnings
  for guarded Node/raw-WASM branches; the selected browser path is physically
  verified in increment 3.

## Next increment

Classify framing and landmark tracking quality, then perform repeatable distance,
occlusion, lighting, and Pose Lite-versus-Full validation.
