# M2 Increment 1 Verification

Date: 2026-07-29

Branch: `m2-landmark-lab`

## Scope

This increment establishes the model-independent landmark contracts, typed future
worker protocol, deterministic fake adapter, and `/lab/landmarks` laboratory shell.
It deliberately introduces no MediaPipe dependency, model, WASM asset, camera request,
or network dependency.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Normalized pose, hand, frame, and capability contracts | [`landmarkTypes.ts`](../../../src/vision/landmarkTypes.ts), [`landmarkValidation.ts`](../../../src/vision/landmarkValidation.ts) | [`landmarkValidation.test.ts`](../../../src/vision/landmarkValidation.test.ts) |
| Vision adapter boundary | [`visionAdapter.ts`](../../../src/vision/visionAdapter.ts), [`fakeVisionAdapter.ts`](../../../src/vision/fakeVisionAdapter.ts) | [`fakeVisionAdapter.test.ts`](../../../src/vision/fakeVisionAdapter.test.ts) |
| Typed worker protocol | [`visionWorkerProtocol.ts`](../../../src/vision/visionWorkerProtocol.ts) | [`visionWorkerProtocol.test.ts`](../../../src/vision/visionWorkerProtocol.test.ts) |
| Landmark laboratory state and simulator | [`useLandmarkLab.ts`](../../../src/labs/landmarks/useLandmarkLab.ts), [`LandmarkLabPage.tsx`](../../../src/labs/landmarks/LandmarkLabPage.tsx), [`LandmarkPreview.tsx`](../../../src/labs/landmarks/LandmarkPreview.tsx), [`LandmarkDiagnostics.tsx`](../../../src/labs/landmarks/LandmarkDiagnostics.tsx), [`landmarkLab.css`](../../../src/labs/landmarks/landmarkLab.css) | [`LandmarkLabPage.test.tsx`](../../../src/labs/landmarks/LandmarkLabPage.test.tsx) |
| M0/M1/M2 routing and navigation | [`routes.ts`](../../../src/app/routes.ts), [`DevelopmentNav.tsx`](../../../src/app/DevelopmentNav.tsx), [`App.tsx`](../../../src/app/App.tsx) | [`routes.test.ts`](../../../src/app/routes.test.ts), [`baseline.spec.ts`](../../../tests/e2e/baseline.spec.ts) |

## Guarantees verified

- Pose frames require exactly 33 normalized landmarks.
- Hands require exactly 21 normalized landmarks and safe handedness metadata.
- Unsafe coordinates, confidence values, and malformed worker messages are rejected.
- The simulator emits deterministic valid frames with one pose and two hands.
- Processing cannot begin before initialization or resume after disposal.
- Starting the simulator updates its diagnostics and overlay.
- Leaving the page disposes the adapter.
- `/lab/landmarks` is reachable from the shared development navigation.
- No real camera or machine-learning runtime is activated.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-001 | Strict TypeScript check | Passed |
| EV-M2-002 | ESLint analysis | Passed |
| EV-M2-003 | Unit and component suite | Passed: 76 tests across 17 files |
| EV-M2-004 | Production build | Passed |
| EV-M2-005 | M0/M1/M2 Chrome smoke suite | Passed: 3 tests |

## Manual review

1. Open `/lab/landmarks` and confirm it says that no camera or MediaPipe model is
   active.
2. Select **Start simulation** and confirm the gold body skeleton and two green hand
   skeletons move slightly.
3. Confirm diagnostics report 33 pose landmarks, 2 hands, 94% tracking quality, and
   `good` framing.
4. Toggle the pose and hand overlays independently.
5. Select **Stop** and confirm the frame stops changing.
6. Navigate among M0, M1, and M2.

## Next increment

Increment 2 will pin `@mediapipe/tasks-vision`, package the Full pose model and WASM
locally, and implement the real worker adapter with one-frame backpressure.
