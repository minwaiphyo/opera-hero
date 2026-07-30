# M2 Increment 1 Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

Merged baseline branch: `m2-hand-landmarker-overlay`

## Scope

This increment builds on the teammate-developed MediaPipe overlay from
`m2-hand-landmarker-overlay`, which has been merged into `main`, and adds the first
model-independent Opera Hero landmark contract on `m2-worker-pipeline`. The existing
live overlay remains behaviorally unchanged while MediaPipe pose and hand results
gain a validated translation boundary for future workers, diagnostics, replay,
framing, and gesture scoring.

## Existing overlay baseline

- `@mediapipe/tasks-vision` is pinned at version `1.0.0`.
- Pose Landmarker Lite runs in `VIDEO` mode with one pose.
- Hand Landmarker runs in `VIDEO` mode with up to two hands.
- GPU is preferred and CPU is used as an initialization fallback.
- Model and WASM assets are served locally.
- Pose and hand skeletons render over the M1 camera preview.
- Detector instances close when the camera overlay is disposed.
- The project owner confirmed the body and hand overlay works on Target A.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Local MediaPipe runtime and models | [`visionFileset.ts`](../../../src/lib/visionFileset.ts), [`copy-wasm.mjs`](../../../scripts/copy-wasm.mjs), [`pose_landmarker_lite.task`](../../../public/models/pose_landmarker_lite.task), [`hand_landmarker.task`](../../../public/models/hand_landmarker.task) | Production build and Chrome smoke suite |
| Pose and hand detector construction | [`poseDetector.ts`](../../../src/lib/poseDetector.ts), [`handDetector.ts`](../../../src/lib/handDetector.ts) | Physical Target A review; dedicated detector tests pending |
| Live overlay prototype | [`useLandmarkOverlay.ts`](../../../src/labs/camera/useLandmarkOverlay.ts), [`CameraPreview.tsx`](../../../src/labs/camera/CameraPreview.tsx), [`cameraLab.css`](../../../src/labs/camera/cameraLab.css) | [`CameraLabPage.test.tsx`](../../../src/labs/camera/CameraLabPage.test.tsx), physical Target A review |
| Model-independent landmark contract | [`visionTypes.ts`](../../../src/vision/visionTypes.ts), [`mediapipeNormalization.ts`](../../../src/vision/mediapipeNormalization.ts) | [`mediapipeNormalization.test.ts`](../../../src/vision/mediapipeNormalization.test.ts) |

## Contract guarantees

- Exactly 33 pose landmarks and 21 landmarks per hand are required.
- MediaPipe-owned arrays and points are copied before leaving the adapter boundary.
- Camera-space coordinates remain unmirrored; display mirroring remains a renderer
  responsibility.
- MediaPipe-reported handedness is preserved but is not yet claimed as calibrated
  anatomical handedness.
- Missing poses and missing handedness metadata produce safe domain values.
- Frame identifiers and capture/completion/inference timing are represented.
- Malformed counts, invalid timing metadata, non-finite coordinates, and out-of-range
  confidence values are handled deterministically.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-001 | Strict TypeScript check | Passed |
| EV-M2-002 | ESLint analysis | Passed |
| EV-M2-003 | Unit and component suite | Passed: 70 tests across 14 files |
| EV-M2-004 | Production build with local WASM copy | Passed |
| EV-M2-005 | Existing Chrome smoke suite | Passed: 2 tests |
| EV-M2-006 | Live pose and hand overlay on Target A | Passed: project-owner confirmation |

## Known limitations

- Pose and hand inference still run sequentially on the main browser thread.
- Fresh-video-frame filtering prevents duplicate inference but is not one-frame
  worker backpressure.
- The canvas still consumes raw MediaPipe results rather than normalized frames.
- Capture-to-result latency, inference percentiles, effective inference FPS, skips,
  tracking loss, and delegate choice are not reported.
- Pose Lite has not yet been benchmarked against Pose Full.
- Framing and application-level tracking quality are not classified.

## Next increment

Define and test the worker protocol and one-frame scheduler using fake worker and
clock boundaries. Live inference will remain unchanged until those concurrency
guarantees pass independently.
