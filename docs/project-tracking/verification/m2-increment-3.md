# M2 Increment 3 Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

## Scope

This increment moves live Pose Lite and Hand Landmarker construction and inference
out of the main browser interface and into a dedicated module worker. Camera frames
cross the boundary as transferable `ImageBitmap` objects through the increment 2
latest-frame scheduler. Normalized landmark frames return to the main thread for
canvas rendering.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Worker-owned MediaPipe detector lifecycle and inference | [`vision.worker.ts`](../../../src/vision/vision.worker.ts) | Production worker bundle plus physical-camera checklist |
| Main-thread worker lifecycle and protocol handling | [`visionWorkerClient.ts`](../../../src/vision/visionWorkerClient.ts) | [`visionWorkerClient.test.ts`](../../../src/vision/visionWorkerClient.test.ts) |
| Transferable camera capture and normalized-result rendering | [`useLandmarkOverlay.ts`](../../../src/labs/camera/useLandmarkOverlay.ts), [`CameraPreview.tsx`](../../../src/labs/camera/CameraPreview.tsx) | Existing camera component and Chrome smoke suites; physical-camera checklist |

## Architectural evidence

- `vision.worker.ts` owns `PoseLandmarker.createFromOptions`,
  `HandLandmarker.createFromOptions`, and both `detectForVideo` calls.
- The main-thread overlay hook does not import detector factories or invoke
  inference.
- Vite emits a separate `vision.worker-*.js` production asset.
- MediaPipe's ES-module worker loader and matching WASM binary are Vite-managed
  URL assets, so `ModuleFactory` is installed correctly in both development and
  production.
- The module factory is explicitly restored before creating each detector because
  MediaPipe 1.0.0 consumes it after every task and dynamic imports are cached.
- The preview badge displays worker-confirmed execution state, delegate, and model.
- Each transferred bitmap is closed by the worker after inference.
- Capture and completion timestamps use high-resolution epoch time so latency is
  comparable across the page and worker performance timelines.
- MediaPipe receives a separate worker-local monotonic timestamp, avoiding its
  internal graph timestamp limit while keeping cross-thread latency measurable.
- GPU initialization is attempted first; the complete detector pair falls back to
  CPU if GPU initialization fails.
- A frame result or frame-scoped error releases scheduler backpressure.
- Invalid worker responses and initialization failures enter a controlled error
  state.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-012 | Strict TypeScript check | Passed |
| EV-M2-013 | ESLint analysis | Passed |
| EV-M2-014 | Unit and component suite | Passed: 85 tests across 17 files |
| EV-M2-015 | Production build, distinct worker bundle, and Vite-managed WASM assets | Passed |
| EV-M2-016 | Existing Chrome smoke suite | Passed: 2 tests |
| EV-M2-017 | Physical worker inference and overlay review | Passed: GPU, Pose Lite, body and hand overlays confirmed |

## Manual physical-camera checklist

Completed by the project owner on Target A:

1. Opened the M1 Camera Laboratory and started the camera.
2. Confirmed the badge reached `Vision worker · GPU · Pose lite`.
3. Confirmed body and hand overlays followed the visitor.

Remaining optional DevTools review:

4. In Chrome DevTools, open **Sources** and confirm the
   `opera-hero-vision` worker/thread exists.
5. Search loaded sources for `detectForVideo`; confirm both calls are in the worker
   bundle.
6. Stop the camera and confirm the overlay clears.
7. Restart the camera and confirm the worker reaches tracking again.
8. Confirm there are no uncaught errors in the Console.

## Known limitations

- Scheduler counts and inference timing are collected internally but are not yet
  displayed.
- The client terminates the worker when the camera overlay is disposed; the browser
  releases the worker realm and its WASM resources.
- Pose Full has not been added or benchmarked.

## Next increment

Expose live throughput, latency, skipped/replaced frames, delegate, and model
diagnostics in the camera laboratory.
