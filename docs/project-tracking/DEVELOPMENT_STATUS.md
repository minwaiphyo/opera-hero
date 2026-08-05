# Opera Hero — Development Status Ledger

## Purpose

This is the authoritative record of what has actually been built.

- [ROADMAP.md](./ROADMAP.md) explains what we intend to build.
- [ARCHITECTURE.md](./ARCHITECTURE.md) explains how the system should be designed.
- This file records what currently exists and what has been verified.

Do not mark a milestone complete merely because its code was written. A milestone is
complete only when its exit gate in the roadmap passes and the evidence is linked
here.

## Current position

| Field | Current value |
|---|---|
| Active milestone | M3 — Gesture scoring laboratory |
| Milestone status | In progress |
| Latest completed milestone | M0 — Decisions and baseline |
| Current vertical slice | None |
| Exhibition readiness | 1 — Development shell runs |
| Last updated | 2026-08-03 |

### Readiness scale

| Level | Meaning |
|---|---|
| 0 | Design and planning only |
| 1 | Development shell runs |
| 2 | Camera and landmarks proven on target hardware |
| 3 | One gesture works in isolation |
| 4 | One complete vertical slice works |
| 5 | Content-complete game works |
| 6 | Kiosk recovery and deployment work |
| 7 | Exhibition release passed soak tests |

## Milestone overview

| ID | Milestone | Status | Progress | Evidence |
|---|---|---|---:|---|
| M0 | Decisions and baseline | Complete | 100% | [`verification/m0-baseline.md`](./verification/m0-baseline.md) |
| M1 | Camera laboratory | Implemented — verification pending | 95% | [`verification/m1-increment-1.md`](./verification/m1-increment-1.md), [`verification/m1-increment-2.md`](./verification/m1-increment-2.md), [`verification/m1-increment-3.md`](./verification/m1-increment-3.md), [`verification/m1-increment-4.md`](./verification/m1-increment-4.md), [`verification/m1-increment-5.md`](./verification/m1-increment-5.md), [`verification/m1-increment-6.md`](./verification/m1-increment-6.md) |
| M2 | Landmark laboratory | In progress | 97% | [`verification/m2-increment-1.md`](./verification/m2-increment-1.md), [`verification/m2-increment-2.md`](./verification/m2-increment-2.md), [`verification/m2-increment-3.md`](./verification/m2-increment-3.md), [`verification/m2-increment-4.md`](./verification/m2-increment-4.md), [`verification/m2-increment-5.md`](./verification/m2-increment-5.md), [`verification/m2-increment-6a.md`](./verification/m2-increment-6a.md), [`verification/m2-increment-6b.md`](./verification/m2-increment-6b.md), [`verification/m2-increment-6c.md`](./verification/m2-increment-6c.md), [`verification/m2-increment-6d.md`](./verification/m2-increment-6d.md), [`verification/m2-increment-7.md`](./verification/m2-increment-7.md) |
| M3 | Gesture scoring laboratory | In progress | 56% | [`verification/m3-fixture-extraction-1.md`](./verification/m3-fixture-extraction-1.md), [`verification/m3-fixture-visualization-2.md`](./verification/m3-fixture-visualization-2.md), [`verification/m3-fixture-batch-3.md`](./verification/m3-fixture-batch-3.md), [`verification/m3-water-sleeves-features-4.md`](./verification/m3-water-sleeves-features-4.md), [`verification/m3-water-sleeves-observability-5.md`](./verification/m3-water-sleeves-observability-5.md), [`verification/m3-water-sleeves-trajectory-6.md`](./verification/m3-water-sleeves-trajectory-6.md), [`verification/m3-water-sleeves-envelope-7.md`](./verification/m3-water-sleeves-envelope-7.md), [`verification/m3-water-sleeves-evaluator-8.md`](./verification/m3-water-sleeves-evaluator-8.md), [`verification/m3-water-sleeves-regressions-9.md`](./verification/m3-water-sleeves-regressions-9.md), [`verification/m3-live-attempt-buffer-10.md`](./verification/m3-live-attempt-buffer-10.md), [`verification/m3-live-water-sleeves-scoring-11.md`](./verification/m3-live-water-sleeves-scoring-11.md), [`verification/m3-water-sleeves-tuning-12.md`](./verification/m3-water-sleeves-tuning-12.md), [`verification/m3-automatic-attempt-capture-13.md`](./verification/m3-automatic-attempt-capture-13.md), [`verification/m3-water-sleeves-capture-tuning-14.md`](./verification/m3-water-sleeves-capture-tuning-14.md) |
| M4 | Gameplay state-machine simulator | Blocked by M0 | 0% | — |
| M5 | First vertical slice | Blocked by M2–M4 | 0% | — |
| M6 | Content pipeline | Blocked by M5 | 0% | — |
| M7 | Final gestures | Blocked by M3 and cultural input | 0% | — |
| M8 | Audio and visual experience | Blocked by M5–M7 | 0% | — |
| M9 | Kiosk hardening | Blocked by M8 | 0% | — |
| M10 | Exhibition validation and freeze | Blocked by M9 | 0% | — |

M3 progress is measured across all three festival gestures. Water Sleeves now has a
complete replay-based evaluator foundation; Opening Door and Orchid Finger remain to
be implemented and validated, so completed Water Sleeves increments do not imply that
M3 is nearly finished.

Allowed status values:

- `Not started`
- `In progress`
- `Blocked`
- `Implemented — verification pending`
- `Complete`
- `Reopened`

## Capability registry

Every meaningful capability receives one row. This creates a direct map from a product
feature to its source, tests, and proof.

| Capability ID | Capability | Milestone | Status | Implementation files | Test files | Verification |
|---|---|---|---|---|---|---|
| PLAN-001 | End-to-end architecture proposal | Planning | Complete | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Review only | Architecture sections 1–16 |
| PLAN-002 | Incremental delivery roadmap | Planning | Complete | [`ROADMAP.md`](./ROADMAP.md) | Review only | Milestones M0–M10 defined |
| PLAN-003 | Development traceability ledger | Planning | Complete | [`DEVELOPMENT_STATUS.md`](./DEVELOPMENT_STATUS.md) | Review only | Ledger structure initialized |
| PLAN-004 | Dan-role cultural gameplay scope | Planning | Complete | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) | Stakeholder scope review | Three interactions recorded; practitioner detail pending |
| PLAN-005 | Practitioner reference-capture plan | Planning | Complete | [`practitioner-session-plan.md`](./practitioner-session-plan.md) | Session checklist review | Proposed 1 August session prepared |
| M0-001 | Strict React/TypeScript application shell | M0 | Complete | [`package.json`](../../package.json), [`src/main.tsx`](../../src/main.tsx), [`vite.config.ts`](../../vite.config.ts) | Build and type checks | EV-M0-001, EV-M0-004 |
| M0-002 | Browser capability collector | M0 | Complete | [`src/platform/capabilities.ts`](../../src/platform/capabilities.ts) | [`src/platform/capabilities.test.ts`](../../src/platform/capabilities.test.ts) | EV-M0-003 |
| M0-003 | Hardware baseline dashboard | M0 | Complete | [`src/app/App.tsx`](../../src/app/App.tsx), [`src/styles.css`](../../src/styles.css) | [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M0-005, EV-M0-006 |
| M0-004 | Provisional target profile | M0 | Complete | [`hardware-baseline.md`](./hardware-baseline.md) | Read-only device checks | EV-M0-007–EV-M0-010 |
| M0-005 | Automated quality pipeline | M0 | Complete | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`eslint.config.js`](../../eslint.config.js), [`playwright.config.ts`](../../playwright.config.ts), [`vitest.config.ts`](../../vitest.config.ts) | Unit, build, and browser suites | EV-M0-001–EV-M0-006 |
| M0-006 | Browser API availability | M0 | Complete | [`src/app/App.tsx`](../../src/app/App.tsx) | Manual target-browser check | EV-M0-011 |
| M0-007 | Camera and audio diagnostic controls | M0 | Complete | [`src/app/HardwareChecks.tsx`](../../src/app/HardwareChecks.tsx), [`src/styles.css`](../../src/styles.css) | [`src/app/HardwareChecks.test.tsx`](../../src/app/HardwareChecks.test.tsx), [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M0-012–EV-M0-016 |
| M1-001 | Camera domain contracts, error model, and capture constraints | M1 | Complete | [`src/camera/cameraTypes.ts`](../../src/camera/cameraTypes.ts), [`src/camera/cameraErrors.ts`](../../src/camera/cameraErrors.ts), [`src/camera/cameraConstraints.ts`](../../src/camera/cameraConstraints.ts) | [`src/camera/cameraErrors.test.ts`](../../src/camera/cameraErrors.test.ts), [`src/camera/cameraConstraints.test.ts`](../../src/camera/cameraConstraints.test.ts) | EV-M1-001–EV-M1-004 |
| M1-002 | M0/M1 development navigation scaffold | M1 | Complete | [`src/app/DevelopmentNav.tsx`](../../src/app/DevelopmentNav.tsx), [`src/app/routes.ts`](../../src/app/routes.ts), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx), [`src/app/App.tsx`](../../src/app/App.tsx) | [`src/app/routes.test.ts`](../../src/app/routes.test.ts), [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M1-003–EV-M1-005 |
| M1-003 | Single-stream camera lifecycle service | M1 | Complete | [`src/camera/mediaDevicesPort.ts`](../../src/camera/mediaDevicesPort.ts), [`src/camera/browserMediaDevices.ts`](../../src/camera/browserMediaDevices.ts), [`src/camera/cameraService.ts`](../../src/camera/cameraService.ts), [`src/camera/cameraErrors.ts`](../../src/camera/cameraErrors.ts), [`src/camera/cameraTypes.ts`](../../src/camera/cameraTypes.ts) | [`src/camera/browserMediaDevices.test.ts`](../../src/camera/browserMediaDevices.test.ts), [`src/camera/cameraService.test.ts`](../../src/camera/cameraService.test.ts), [`src/camera/cameraErrors.test.ts`](../../src/camera/cameraErrors.test.ts) | EV-M1-006–EV-M1-010 |
| M1-004 | Camera discovery, preferences, and fallback selection | M1 | Complete | [`src/camera/mediaDevicesPort.ts`](../../src/camera/mediaDevicesPort.ts), [`src/camera/browserMediaDevices.ts`](../../src/camera/browserMediaDevices.ts), [`src/camera/cameraPreferences.ts`](../../src/camera/cameraPreferences.ts), [`src/camera/deviceSelection.ts`](../../src/camera/deviceSelection.ts), [`src/camera/cameraDeviceCatalog.ts`](../../src/camera/cameraDeviceCatalog.ts) | [`src/camera/browserMediaDevices.test.ts`](../../src/camera/browserMediaDevices.test.ts), [`src/camera/cameraPreferences.test.ts`](../../src/camera/cameraPreferences.test.ts), [`src/camera/deviceSelection.test.ts`](../../src/camera/deviceSelection.test.ts), [`src/camera/cameraDeviceCatalog.test.ts`](../../src/camera/cameraDeviceCatalog.test.ts) | EV-M1-011–EV-M1-015 |
| M1-005 | Live camera laboratory preview, controls, and diagnostics | M1 | Complete | [`src/labs/camera/cameraLabRuntime.ts`](../../src/labs/camera/cameraLabRuntime.ts), [`src/labs/camera/useCameraLab.ts`](../../src/labs/camera/useCameraLab.ts), [`src/labs/camera/CameraPreview.tsx`](../../src/labs/camera/CameraPreview.tsx), [`src/labs/camera/CameraControls.tsx`](../../src/labs/camera/CameraControls.tsx), [`src/labs/camera/CameraDiagnostics.tsx`](../../src/labs/camera/CameraDiagnostics.tsx), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx), [`src/labs/camera/cameraLab.css`](../../src/labs/camera/cameraLab.css), [`src/app/App.tsx`](../../src/app/App.tsx) | [`src/labs/camera/CameraLabPage.test.tsx`](../../src/labs/camera/CameraLabPage.test.tsx), [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M1-016–EV-M1-021 |
| M1-006 | Aspect-ratio diagnostics and bounded recovery | M1 | Complete | [`src/camera/cameraRecovery.ts`](../../src/camera/cameraRecovery.ts), [`src/labs/camera/useCameraLab.ts`](../../src/labs/camera/useCameraLab.ts), [`src/labs/camera/CameraControls.tsx`](../../src/labs/camera/CameraControls.tsx), [`src/labs/camera/CameraDiagnostics.tsx`](../../src/labs/camera/CameraDiagnostics.tsx), [`src/labs/camera/cameraLab.css`](../../src/labs/camera/cameraLab.css) | [`src/camera/cameraRecovery.test.ts`](../../src/camera/cameraRecovery.test.ts), [`src/labs/camera/CameraLabPage.test.tsx`](../../src/labs/camera/CameraLabPage.test.tsx) | EV-M1-022–EV-M1-027; static guide historically verified, then superseded by M2-003 |
| M1-007 | Lifecycle stress and long-running stability monitor | M1 | Implemented — verification pending | [`src/camera/cameraStability.ts`](../../src/camera/cameraStability.ts), [`src/labs/camera/CameraStabilityPanel.tsx`](../../src/labs/camera/CameraStabilityPanel.tsx), [`src/labs/camera/CameraPreview.tsx`](../../src/labs/camera/CameraPreview.tsx), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx), [`src/labs/camera/cameraLab.css`](../../src/labs/camera/cameraLab.css) | [`src/camera/cameraStability.test.ts`](../../src/camera/cameraStability.test.ts), [`src/camera/cameraService.test.ts`](../../src/camera/cameraService.test.ts), [`src/labs/camera/CameraLabPage.test.tsx`](../../src/labs/camera/CameraLabPage.test.tsx), [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M1-028–EV-M1-032; one-hour Target A soak pending |
| M2-001 | Local MediaPipe runtime and model assets | M2 | Complete | [`package.json`](../../package.json), [`src/vision/vision.worker.ts`](../../src/vision/vision.worker.ts), [`public/models/pose_landmarker_lite.task`](../../public/models/pose_landmarker_lite.task), [`public/models/hand_landmarker.task`](../../public/models/hand_landmarker.task) | Build and browser suites | EV-M2-004–EV-M2-006, EV-M2-015 |
| M2-002 | Pose Lite and two-hand detector construction with GPU/CPU fallback | M2 | Complete | [`src/vision/vision.worker.ts`](../../src/vision/vision.worker.ts) | Physical Target A review; worker delegation review pending | EV-M2-006, EV-M2-015 |
| M2-003 | Live pose and hand camera overlay prototype | M2 | Complete | [`src/labs/camera/useLandmarkOverlay.ts`](../../src/labs/camera/useLandmarkOverlay.ts), [`src/labs/camera/CameraPreview.tsx`](../../src/labs/camera/CameraPreview.tsx), [`src/labs/camera/cameraLab.css`](../../src/labs/camera/cameraLab.css) | [`src/labs/camera/CameraLabPage.test.tsx`](../../src/labs/camera/CameraLabPage.test.tsx) | EV-M2-003, EV-M2-006 |
| M2-004 | Model-independent pose and hand frame normalization | M2 | Complete | [`src/vision/visionTypes.ts`](../../src/vision/visionTypes.ts), [`src/vision/mediapipeNormalization.ts`](../../src/vision/mediapipeNormalization.ts) | [`src/vision/mediapipeNormalization.test.ts`](../../src/vision/mediapipeNormalization.test.ts) | EV-M2-001–EV-M2-005 |
| M2-005 | Typed worker protocol and latest-frame backpressure scheduler | M2 | Complete | [`src/vision/visionWorkerProtocol.ts`](../../src/vision/visionWorkerProtocol.ts), [`src/vision/latestFrameScheduler.ts`](../../src/vision/latestFrameScheduler.ts) | [`src/vision/visionWorkerProtocol.test.ts`](../../src/vision/visionWorkerProtocol.test.ts), [`src/vision/latestFrameScheduler.test.ts`](../../src/vision/latestFrameScheduler.test.ts) | EV-M2-007–EV-M2-011 |
| M2-006 | Worker-owned live pose and hand inference pipeline | M2 | Complete | [`src/vision/vision.worker.ts`](../../src/vision/vision.worker.ts), [`src/vision/visionWorkerClient.ts`](../../src/vision/visionWorkerClient.ts), [`src/labs/camera/useLandmarkOverlay.ts`](../../src/labs/camera/useLandmarkOverlay.ts), [`src/labs/camera/CameraPreview.tsx`](../../src/labs/camera/CameraPreview.tsx) | [`src/vision/visionWorkerClient.test.ts`](../../src/vision/visionWorkerClient.test.ts), [`src/labs/camera/CameraLabPage.test.tsx`](../../src/labs/camera/CameraLabPage.test.tsx) | EV-M2-012–EV-M2-017 |
| M2-007 | Bounded live worker performance and backpressure diagnostics | M2 | Complete | [`src/vision/visionDiagnostics.ts`](../../src/vision/visionDiagnostics.ts), [`src/vision/visionRuntime.ts`](../../src/vision/visionRuntime.ts), [`src/labs/camera/VisionDiagnosticsPanel.tsx`](../../src/labs/camera/VisionDiagnosticsPanel.tsx), [`src/labs/camera/useLandmarkOverlay.ts`](../../src/labs/camera/useLandmarkOverlay.ts) | [`src/vision/visionDiagnostics.test.ts`](../../src/vision/visionDiagnostics.test.ts), [`src/labs/camera/VisionDiagnosticsPanel.test.tsx`](../../src/labs/camera/VisionDiagnosticsPanel.test.tsx) | EV-M2-018–EV-M2-023 |
| M2-008 | Visitor presence, framing, and tracking-quality classification | M2 | Complete | [`src/vision/visionQuality.ts`](../../src/vision/visionQuality.ts), [`src/vision/visionDiagnostics.ts`](../../src/vision/visionDiagnostics.ts), [`src/labs/camera/VisionDiagnosticsPanel.tsx`](../../src/labs/camera/VisionDiagnosticsPanel.tsx) | [`src/vision/visionQuality.test.ts`](../../src/vision/visionQuality.test.ts), [`src/vision/visionDiagnostics.test.ts`](../../src/vision/visionDiagnostics.test.ts), [`src/labs/camera/VisionDiagnosticsPanel.test.tsx`](../../src/labs/camera/VisionDiagnosticsPanel.test.tsx) | EV-M2-024–EV-M2-029 |
| M2-009 | Versioned deterministic landmark replay contract and validation | M2 | Complete | [`src/vision/replay/visionReplayTypes.ts`](../../src/vision/replay/visionReplayTypes.ts), [`src/vision/replay/visionReplayValidation.ts`](../../src/vision/replay/visionReplayValidation.ts), [`src/vision/replay/fixtures/empty-zone.json`](../../src/vision/replay/fixtures/empty-zone.json) | [`src/vision/replay/visionReplayValidation.test.ts`](../../src/vision/replay/visionReplayValidation.test.ts) | EV-M2-030–EV-M2-034 |
| M2-010 | Common vision adapter and deterministic replay clock | M2 | Complete | [`src/vision/visionAdapter.ts`](../../src/vision/visionAdapter.ts), [`src/vision/replay/replayClock.ts`](../../src/vision/replay/replayClock.ts), [`src/vision/replay/replayVisionAdapter.ts`](../../src/vision/replay/replayVisionAdapter.ts) | [`src/vision/replay/replayVisionAdapter.test.ts`](../../src/vision/replay/replayVisionAdapter.test.ts) | EV-M2-035–EV-M2-039 |
| M2-011 | Landmark replay laboratory and shared live/replay renderer | M2 | Implemented — verification pending | [`src/vision/renderLandmarkFrame.ts`](../../src/vision/renderLandmarkFrame.ts), [`src/vision/replay/replayFixtureCatalog.ts`](../../src/vision/replay/replayFixtureCatalog.ts), [`src/vision/replay/syntheticReplayFixtures.ts`](../../src/vision/replay/syntheticReplayFixtures.ts), [`src/labs/landmarks/LandmarkLabPage.tsx`](../../src/labs/landmarks/LandmarkLabPage.tsx), [`src/labs/landmarks/LandmarkReplayCanvas.tsx`](../../src/labs/landmarks/LandmarkReplayCanvas.tsx), [`src/labs/landmarks/useReplayLandmarkLab.ts`](../../src/labs/landmarks/useReplayLandmarkLab.ts), [`src/labs/landmarks/landmarkLab.css`](../../src/labs/landmarks/landmarkLab.css) | [`src/labs/landmarks/LandmarkLabPage.test.tsx`](../../src/labs/landmarks/LandmarkLabPage.test.tsx), [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M2-040–EV-M2-044; physical replay review pending |
| M2-012 | Readiness-gated landmark capture startup | M2 | Implemented — verification pending | [`src/vision/visionWorkerClient.ts`](../../src/vision/visionWorkerClient.ts), [`src/labs/camera/useLandmarkOverlay.ts`](../../src/labs/camera/useLandmarkOverlay.ts) | [`src/vision/visionWorkerClient.test.ts`](../../src/vision/visionWorkerClient.test.ts) | EV-M2-045–EV-M2-049; physical startup review pending |
| M2-013 | Bounded inference-frame capture | M2 | Complete | [`src/vision/visionCapture.ts`](../../src/vision/visionCapture.ts), [`src/labs/camera/useLandmarkOverlay.ts`](../../src/labs/camera/useLandmarkOverlay.ts), [`src/labs/camera/VisionDiagnosticsPanel.tsx`](../../src/labs/camera/VisionDiagnosticsPanel.tsx) | [`src/vision/visionCapture.test.ts`](../../src/vision/visionCapture.test.ts), [`src/labs/camera/VisionDiagnosticsPanel.test.tsx`](../../src/labs/camera/VisionDiagnosticsPanel.test.tsx) | EV-M2-050–EV-M2-055 |
| M3-001 | Offline practitioner landmark fixture extraction | M3 | Implemented — verification pending | [`scripts/extract_landmark_fixture.py`](../../scripts/extract_landmark_fixture.py), [`scripts/landmark_fixtures/motion.py`](../../scripts/landmark_fixtures/motion.py), [`scripts/landmark_fixtures/fixture.py`](../../scripts/landmark_fixtures/fixture.py), [`requirements-fixtures.txt`](../../requirements-fixtures.txt), [`src/vision/replay/visionReplayTypes.ts`](../../src/vision/replay/visionReplayTypes.ts), [`src/vision/replay/visionReplayValidation.ts`](../../src/vision/replay/visionReplayValidation.ts) | [`scripts/tests/test_landmark_fixtures.py`](../../scripts/tests/test_landmark_fixtures.py), [`src/vision/replay/visionReplayValidation.test.ts`](../../src/vision/replay/visionReplayValidation.test.ts) | EV-M3-001–EV-M3-006; manual trim-boundary review pending |
| M3-002 | Local practitioner fixture visualization | M3 | Complete | [`src/labs/landmarks/LandmarkLabPage.tsx`](../../src/labs/landmarks/LandmarkLabPage.tsx), [`src/labs/landmarks/landmarkLab.css`](../../src/labs/landmarks/landmarkLab.css) | [`src/labs/landmarks/LandmarkLabPage.test.tsx`](../../src/labs/landmarks/LandmarkLabPage.test.tsx), [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M3-007–EV-M3-013 |
| M3-003 | Curated practitioner fixture batch | M3 | Complete | [`scripts/extract_practitioner_fixture_batch.py`](../../scripts/extract_practitioner_fixture_batch.py), [`scripts/landmark_fixtures/batch.py`](../../scripts/landmark_fixtures/batch.py), [`scripts/landmark_fixtures/practitioner_fixture_manifest.json`](../../scripts/landmark_fixtures/practitioner_fixture_manifest.json) | [`scripts/tests/test_landmark_fixtures.py`](../../scripts/tests/test_landmark_fixtures.py) | EV-M3-014–EV-M3-018; all fixtures visually approved, with Water Sleeves restricted to required pose/arm signals |
| M3-004 | Water Sleeves normalized frame features | M3 | Complete | [`src/domain/gestures/features/geometry.ts`](../../src/domain/gestures/features/geometry.ts), [`src/domain/gestures/features/waterSleevesFeatures.ts`](../../src/domain/gestures/features/waterSleevesFeatures.ts) | [`src/domain/gestures/features/waterSleevesFeatures.test.ts`](../../src/domain/gestures/features/waterSleevesFeatures.test.ts) | EV-M3-019–EV-M3-023 |
| M3-005 | Water Sleeves feature observability | M3 | Implemented — project-owner verification pending | [`src/labs/landmarks/WaterSleevesFeaturePanel.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.tsx), [`src/labs/landmarks/LandmarkLabPage.tsx`](../../src/labs/landmarks/LandmarkLabPage.tsx), [`src/labs/landmarks/landmarkLab.css`](../../src/labs/landmarks/landmarkLab.css) | [`src/labs/landmarks/WaterSleevesFeaturePanel.test.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.test.tsx), [`src/labs/landmarks/LandmarkLabPage.test.tsx`](../../src/labs/landmarks/LandmarkLabPage.test.tsx) | EV-M3-024–EV-M3-028; project-owner replay review pending |
| M3-006 | Water Sleeves temporal trajectory and coverage | M3 | Implemented — project-owner verification pending | [`src/domain/gestures/features/waterSleevesTrajectory.ts`](../../src/domain/gestures/features/waterSleevesTrajectory.ts), [`src/labs/landmarks/WaterSleevesFeaturePanel.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.tsx) | [`src/domain/gestures/features/waterSleevesTrajectory.test.ts`](../../src/domain/gestures/features/waterSleevesTrajectory.test.ts), [`src/labs/landmarks/WaterSleevesFeaturePanel.test.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.test.tsx) | EV-M3-029–EV-M3-034; project-owner coverage review pending |
| M3-007 | Water Sleeves compact reference envelope | M3 | Implemented — project-owner verification pending | [`src/domain/gestures/scoring/waterSleevesEnvelope.ts`](../../src/domain/gestures/scoring/waterSleevesEnvelope.ts), [`src/domain/gestures/references/waterSleeves.reference.json`](../../src/domain/gestures/references/waterSleeves.reference.json), [`scripts/generate_water_sleeves_reference.mjs`](../../scripts/generate_water_sleeves_reference.mjs), [`src/labs/landmarks/WaterSleevesFeaturePanel.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.tsx) | [`src/domain/gestures/scoring/waterSleevesEnvelope.test.ts`](../../src/domain/gestures/scoring/waterSleevesEnvelope.test.ts), [`src/domain/gestures/references/waterSleevesReference.test.ts`](../../src/domain/gestures/references/waterSleevesReference.test.ts) | EV-M3-035–EV-M3-041; project-owner envelope review pending |
| M3-008 | Water Sleeves temporal alignment and soft scoring | M3 | Implemented — project-owner verification pending | [`src/domain/gestures/scoring/waterSleevesEvaluator.ts`](../../src/domain/gestures/scoring/waterSleevesEvaluator.ts), [`src/labs/landmarks/WaterSleevesFeaturePanel.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.tsx) | [`src/domain/gestures/scoring/waterSleevesEvaluator.test.ts`](../../src/domain/gestures/scoring/waterSleevesEvaluator.test.ts), [`src/labs/landmarks/WaterSleevesFeaturePanel.test.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.test.tsx) | EV-M3-042–EV-M3-047; project-owner evaluator review pending |
| M3-009 | Water Sleeves deterministic evaluator regressions | M3 | Implemented — project-owner verification pending | [`src/domain/gestures/scoring/waterSleevesRegressions.ts`](../../src/domain/gestures/scoring/waterSleevesRegressions.ts), [`src/labs/landmarks/WaterSleevesFeaturePanel.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.tsx) | [`src/domain/gestures/scoring/waterSleevesRegressions.test.ts`](../../src/domain/gestures/scoring/waterSleevesRegressions.test.ts), [`src/labs/landmarks/WaterSleevesFeaturePanel.test.tsx`](../../src/labs/landmarks/WaterSleevesFeaturePanel.test.tsx) | EV-M3-048–EV-M3-052; project-owner regression-table review pending |
| M3-010 | Bounded live Water Sleeves attempt buffer | M3 | Complete | [`src/domain/gestures/live/waterSleevesAttemptBuffer.ts`](../../src/domain/gestures/live/waterSleevesAttemptBuffer.ts), [`src/domain/gestures/features/waterSleevesTrajectory.ts`](../../src/domain/gestures/features/waterSleevesTrajectory.ts) | [`src/domain/gestures/live/waterSleevesAttemptBuffer.test.ts`](../../src/domain/gestures/live/waterSleevesAttemptBuffer.test.ts), [`src/domain/gestures/features/waterSleevesTrajectory.test.ts`](../../src/domain/gestures/features/waterSleevesTrajectory.test.ts) | EV-M3-053–EV-M3-057 |
| M3-011 | Live Water Sleeves camera scoring laboratory and practitioner guide | M3 | Implemented — project-owner verification pending | [`src/labs/camera/useLandmarkOverlay.ts`](../../src/labs/camera/useLandmarkOverlay.ts), [`src/labs/camera/useWaterSleevesLiveScoring.ts`](../../src/labs/camera/useWaterSleevesLiveScoring.ts), [`src/labs/camera/WaterSleevesLiveScoringPanel.tsx`](../../src/labs/camera/WaterSleevesLiveScoringPanel.tsx), [`src/labs/camera/WaterSleevesReferenceGuide.tsx`](../../src/labs/camera/WaterSleevesReferenceGuide.tsx), [`src/domain/gestures/references/waterSleeves.guide.json`](../../src/domain/gestures/references/waterSleeves.guide.json), [`src/labs/camera/CameraPreview.tsx`](../../src/labs/camera/CameraPreview.tsx), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx) | [`src/labs/camera/useWaterSleevesLiveScoring.test.tsx`](../../src/labs/camera/useWaterSleevesLiveScoring.test.tsx), [`src/labs/camera/WaterSleevesLiveScoringPanel.test.tsx`](../../src/labs/camera/WaterSleevesLiveScoringPanel.test.tsx), [`src/labs/camera/WaterSleevesReferenceGuide.test.tsx`](../../src/labs/camera/WaterSleevesReferenceGuide.test.tsx), [`src/labs/camera/CameraLabPage.test.tsx`](../../src/labs/camera/CameraLabPage.test.tsx) | EV-M3-058–EV-M3-062; physical-camera attempt pending |
| M3-012 | Evidence-driven Water Sleeves tuning session | M3 | Implemented — physical observations pending | [`src/domain/gestures/tuning/waterSleevesTuning.ts`](../../src/domain/gestures/tuning/waterSleevesTuning.ts), [`src/labs/camera/WaterSleevesTuningPanel.tsx`](../../src/labs/camera/WaterSleevesTuningPanel.tsx), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx) | [`src/domain/gestures/tuning/waterSleevesTuning.test.ts`](../../src/domain/gestures/tuning/waterSleevesTuning.test.ts), [`src/labs/camera/WaterSleevesTuningPanel.test.tsx`](../../src/labs/camera/WaterSleevesTuningPanel.test.tsx) | EV-M3-063–EV-M3-067; three correct, partial, and incorrect physical attempts requested |
| M3-013 | Automatic Water Sleeves attempt boundaries | M3 | Complete — onset superseded by M3-014 | [`src/domain/gestures/live/waterSleevesAutomaticCapture.ts`](../../src/domain/gestures/live/waterSleevesAutomaticCapture.ts), [`src/labs/camera/useWaterSleevesLiveScoring.ts`](../../src/labs/camera/useWaterSleevesLiveScoring.ts), [`src/labs/camera/WaterSleevesLiveScoringPanel.tsx`](../../src/labs/camera/WaterSleevesLiveScoringPanel.tsx), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx) | [`src/domain/gestures/live/waterSleevesAutomaticCapture.test.ts`](../../src/domain/gestures/live/waterSleevesAutomaticCapture.test.ts), [`src/labs/camera/useWaterSleevesLiveScoring.test.tsx`](../../src/labs/camera/useWaterSleevesLiveScoring.test.tsx), [`src/labs/camera/WaterSleevesLiveScoringPanel.test.tsx`](../../src/labs/camera/WaterSleevesLiveScoringPanel.test.tsx) | EV-M3-068–EV-M3-073; motion onset replaced by fixed countdown start |
| M3-014 | Evidence-driven Water Sleeves capture tuning | M3 | Complete — moderate accuracy | [`src/domain/gestures/live/waterSleevesAutomaticCapture.ts`](../../src/domain/gestures/live/waterSleevesAutomaticCapture.ts), [`src/labs/camera/WaterSleevesReferenceGuide.tsx`](../../src/labs/camera/WaterSleevesReferenceGuide.tsx), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx) | [`src/domain/gestures/live/waterSleevesAutomaticCapture.test.ts`](../../src/domain/gestures/live/waterSleevesAutomaticCapture.test.ts), [`src/labs/camera/useWaterSleevesLiveScoring.test.tsx`](../../src/labs/camera/useWaterSleevesLiveScoring.test.tsx), [`src/labs/camera/WaterSleevesReferenceGuide.test.tsx`](../../src/labs/camera/WaterSleevesReferenceGuide.test.tsx) | EV-M3-074–EV-M3-078; fixed countdown, hesitation guard, and automatic completion physically approved; cross-gesture tuning deferred |
| M3-015 | Shared gesture scoring contract | M3 | Complete | [`src/domain/gestures/scoring/gestureScoringContract.ts`](../../src/domain/gestures/scoring/gestureScoringContract.ts), [`src/domain/gestures/scoring/waterSleevesEvaluator.ts`](../../src/domain/gestures/scoring/waterSleevesEvaluator.ts) | [`src/domain/gestures/scoring/gestureScoringContract.test.ts`](../../src/domain/gestures/scoring/gestureScoringContract.test.ts), [`src/domain/gestures/scoring/waterSleevesEvaluator.test.ts`](../../src/domain/gestures/scoring/waterSleevesEvaluator.test.ts) | EV-M3-079–EV-M3-082 |
| M3-016 | Opening Door normalized frame features | M3 | Complete | [`src/domain/gestures/features/openingDoorFeatures.ts`](../../src/domain/gestures/features/openingDoorFeatures.ts) | [`src/domain/gestures/features/openingDoorFeatures.test.ts`](../../src/domain/gestures/features/openingDoorFeatures.test.ts) | EV-M3-083–EV-M3-086 |
| M3-017 | Opening Door temporal trajectory and two-take reference envelope | M3 | Complete | [`src/domain/gestures/features/openingDoorTrajectory.ts`](../../src/domain/gestures/features/openingDoorTrajectory.ts), [`src/domain/gestures/scoring/openingDoorEnvelope.ts`](../../src/domain/gestures/scoring/openingDoorEnvelope.ts), [`src/domain/gestures/references/openingDoor.reference.json`](../../src/domain/gestures/references/openingDoor.reference.json), [`src/domain/gestures/references/openingDoorReference.ts`](../../src/domain/gestures/references/openingDoorReference.ts), [`scripts/generate_opening_door_reference.mjs`](../../scripts/generate_opening_door_reference.mjs) | [`src/domain/gestures/features/openingDoorTrajectory.test.ts`](../../src/domain/gestures/features/openingDoorTrajectory.test.ts), [`src/domain/gestures/scoring/openingDoorEnvelope.test.ts`](../../src/domain/gestures/scoring/openingDoorEnvelope.test.ts), [`src/domain/gestures/references/openingDoorReference.test.ts`](../../src/domain/gestures/references/openingDoorReference.test.ts) | EV-M3-087–EV-M3-091 |
| M3-018 | Opening Door temporal alignment and soft similarity | M3 | Complete | [`src/domain/gestures/scoring/openingDoorEvaluator.ts`](../../src/domain/gestures/scoring/openingDoorEvaluator.ts) | [`src/domain/gestures/scoring/openingDoorEvaluator.test.ts`](../../src/domain/gestures/scoring/openingDoorEvaluator.test.ts) | EV-M3-092–EV-M3-097 |
| M3-019 | Live Opening Door scoring and practitioner guide | M3 | Complete — moderate accuracy | [`src/domain/gestures/features/openingDoorTrajectory.ts`](../../src/domain/gestures/features/openingDoorTrajectory.ts), [`src/domain/gestures/references/openingDoor.guide.json`](../../src/domain/gestures/references/openingDoor.guide.json), [`scripts/generate_opening_door_guide.mjs`](../../scripts/generate_opening_door_guide.mjs), [`src/labs/camera/useOpeningDoorLiveScoring.ts`](../../src/labs/camera/useOpeningDoorLiveScoring.ts), [`src/labs/camera/OpeningDoorLiveScoringPanel.tsx`](../../src/labs/camera/OpeningDoorLiveScoringPanel.tsx), [`src/labs/camera/OpeningDoorReferenceGuide.tsx`](../../src/labs/camera/OpeningDoorReferenceGuide.tsx), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx) | [`src/labs/camera/useOpeningDoorLiveScoring.test.tsx`](../../src/labs/camera/useOpeningDoorLiveScoring.test.tsx), [`src/labs/camera/OpeningDoorReferenceGuide.test.tsx`](../../src/labs/camera/OpeningDoorReferenceGuide.test.tsx), [`src/labs/camera/CameraLabPage.test.tsx`](../../src/labs/camera/CameraLabPage.test.tsx) | EV-M3-098–EV-M3-104; live normal/slow attempts and gesture switching physically approved |
| M3-020 | Orchid Finger normalized frame features | M3 | Complete | [`src/domain/gestures/features/orchidFingerFeatures.ts`](../../src/domain/gestures/features/orchidFingerFeatures.ts) | [`src/domain/gestures/features/orchidFingerFeatures.test.ts`](../../src/domain/gestures/features/orchidFingerFeatures.test.ts) | EV-M3-105–EV-M3-108 |
| M3-021 | Orchid Finger trajectory and three-take reference envelope | M3 | Complete | [`src/domain/gestures/features/orchidFingerTrajectory.ts`](../../src/domain/gestures/features/orchidFingerTrajectory.ts), [`src/domain/gestures/scoring/orchidFingerEnvelope.ts`](../../src/domain/gestures/scoring/orchidFingerEnvelope.ts), [`src/domain/gestures/references/orchidFinger.reference.json`](../../src/domain/gestures/references/orchidFinger.reference.json), [`src/domain/gestures/references/orchidFingerReference.ts`](../../src/domain/gestures/references/orchidFingerReference.ts), [`scripts/generate_orchid_finger_reference.mjs`](../../scripts/generate_orchid_finger_reference.mjs) | [`src/domain/gestures/features/orchidFingerTrajectory.test.ts`](../../src/domain/gestures/features/orchidFingerTrajectory.test.ts), [`src/domain/gestures/scoring/orchidFingerEnvelope.test.ts`](../../src/domain/gestures/scoring/orchidFingerEnvelope.test.ts), [`src/domain/gestures/references/orchidFingerReference.test.ts`](../../src/domain/gestures/references/orchidFingerReference.test.ts) | EV-M3-109–EV-M3-113 |
| M3-022 | Orchid Finger temporal alignment and coverage-aware soft similarity | M3 | Complete | [`src/domain/gestures/scoring/orchidFingerEvaluator.ts`](../../src/domain/gestures/scoring/orchidFingerEvaluator.ts) | [`src/domain/gestures/scoring/orchidFingerEvaluator.test.ts`](../../src/domain/gestures/scoring/orchidFingerEvaluator.test.ts) | EV-M3-114–EV-M3-118 |
| M3-023 | Live Orchid Finger scoring and practitioner guide | M3 | Complete — capture flow approved | [`src/domain/gestures/features/orchidFingerTrajectory.ts`](../../src/domain/gestures/features/orchidFingerTrajectory.ts), [`src/domain/gestures/live/orchidFingerMotion.ts`](../../src/domain/gestures/live/orchidFingerMotion.ts), [`src/domain/gestures/references/orchidFinger.guide.json`](../../src/domain/gestures/references/orchidFinger.guide.json), [`scripts/generate_orchid_finger_guide.mjs`](../../scripts/generate_orchid_finger_guide.mjs), [`src/labs/camera/useOrchidFingerLiveScoring.ts`](../../src/labs/camera/useOrchidFingerLiveScoring.ts), [`src/labs/camera/OrchidFingerLiveScoringPanel.tsx`](../../src/labs/camera/OrchidFingerLiveScoringPanel.tsx), [`src/labs/camera/OrchidFingerReferenceGuide.tsx`](../../src/labs/camera/OrchidFingerReferenceGuide.tsx), [`src/labs/camera/CameraLabPage.tsx`](../../src/labs/camera/CameraLabPage.tsx) | [`src/domain/gestures/live/orchidFingerMotion.test.ts`](../../src/domain/gestures/live/orchidFingerMotion.test.ts), [`src/labs/camera/useOrchidFingerLiveScoring.test.tsx`](../../src/labs/camera/useOrchidFingerLiveScoring.test.tsx), [`src/labs/camera/OrchidFingerReferenceGuide.test.tsx`](../../src/labs/camera/OrchidFingerReferenceGuide.test.tsx), [`src/labs/camera/CameraLabPage.test.tsx`](../../src/labs/camera/CameraLabPage.test.tsx) | EV-M3-119–EV-M3-125; physical capture flow approved, score tuning remains future work |
| M3-024 | First-reference-cycle capture protection | M3 | Complete | [`src/labs/camera/useWaterSleevesLiveScoring.ts`](../../src/labs/camera/useWaterSleevesLiveScoring.ts), [`src/labs/camera/useOpeningDoorLiveScoring.ts`](../../src/labs/camera/useOpeningDoorLiveScoring.ts), [`src/labs/camera/useOrchidFingerLiveScoring.ts`](../../src/labs/camera/useOrchidFingerLiveScoring.ts) | [`src/domain/gestures/live/waterSleevesAutomaticCapture.test.ts`](../../src/domain/gestures/live/waterSleevesAutomaticCapture.test.ts), [`src/labs/camera/useWaterSleevesLiveScoring.test.tsx`](../../src/labs/camera/useWaterSleevesLiveScoring.test.tsx), [`src/labs/camera/useOpeningDoorLiveScoring.test.tsx`](../../src/labs/camera/useOpeningDoorLiveScoring.test.tsx), [`src/labs/camera/useOrchidFingerLiveScoring.test.tsx`](../../src/labs/camera/useOrchidFingerLiveScoring.test.tsx) | EV-M3-126–EV-M3-131; all three gesture minimums physically approved |
| M3-025 | Water Sleeves movement-completeness scoring and stationary completion | M3 | Complete — stationary discrimination approved | [`src/domain/gestures/scoring/waterSleevesEvaluator.ts`](../../src/domain/gestures/scoring/waterSleevesEvaluator.ts), [`src/domain/gestures/live/waterSleevesAutomaticCapture.ts`](../../src/domain/gestures/live/waterSleevesAutomaticCapture.ts), [`src/labs/camera/useWaterSleevesLiveScoring.ts`](../../src/labs/camera/useWaterSleevesLiveScoring.ts), [`src/labs/camera/WaterSleevesLiveScoringPanel.tsx`](../../src/labs/camera/WaterSleevesLiveScoringPanel.tsx) | [`src/domain/gestures/scoring/waterSleevesEvaluator.test.ts`](../../src/domain/gestures/scoring/waterSleevesEvaluator.test.ts), [`src/domain/gestures/live/waterSleevesAutomaticCapture.test.ts`](../../src/domain/gestures/live/waterSleevesAutomaticCapture.test.ts), [`src/labs/camera/WaterSleevesLiveScoringPanel.test.tsx`](../../src/labs/camera/WaterSleevesLiveScoringPanel.test.tsx) | EV-M3-132–EV-M3-137; stationary attempt reduced from 73.1% to 8.3%, broader tuning remains future work |
| M3-026 | Opening Door movement completeness and stationary completion | M3 | Complete — stationary discrimination approved | [`src/domain/gestures/scoring/openingDoorEvaluator.ts`](../../src/domain/gestures/scoring/openingDoorEvaluator.ts), [`src/labs/camera/useOpeningDoorLiveScoring.ts`](../../src/labs/camera/useOpeningDoorLiveScoring.ts), [`src/labs/camera/OpeningDoorLiveScoringPanel.tsx`](../../src/labs/camera/OpeningDoorLiveScoringPanel.tsx) | [`src/domain/gestures/scoring/openingDoorEvaluator.test.ts`](../../src/domain/gestures/scoring/openingDoorEvaluator.test.ts), [`src/labs/camera/useOpeningDoorLiveScoring.test.tsx`](../../src/labs/camera/useOpeningDoorLiveScoring.test.tsx) | EV-M3-138–EV-M3-143; stationary 2.2% versus sincere 72.9%, both completing at the first-cycle boundary |
| M3-027 | Orchid Finger movement completeness and stationary completion | M3 | Complete — stationary discrimination approved | [`src/domain/gestures/scoring/orchidFingerEvaluator.ts`](../../src/domain/gestures/scoring/orchidFingerEvaluator.ts), [`src/labs/camera/useOrchidFingerLiveScoring.ts`](../../src/labs/camera/useOrchidFingerLiveScoring.ts), [`src/labs/camera/OrchidFingerLiveScoringPanel.tsx`](../../src/labs/camera/OrchidFingerLiveScoringPanel.tsx) | [`src/domain/gestures/scoring/orchidFingerEvaluator.test.ts`](../../src/domain/gestures/scoring/orchidFingerEvaluator.test.ts), [`src/labs/camera/useOrchidFingerLiveScoring.test.tsx`](../../src/labs/camera/useOrchidFingerLiveScoring.test.tsx) | EV-M3-144–EV-M3-149; stationary 2.2% versus sincere 73.2%, both completing at the first-cycle boundary |

### Registry rules

1. Assign a stable capability ID before or when implementation begins.
2. Link exact source and test files; do not link only a broad folder when narrower
   ownership is known.
3. One file may support multiple capabilities.
4. Generated build output and dependencies are not implementation files.
5. A capability cannot be `Complete` without a verification result.
6. If later work breaks a completed capability, mark it `Reopened`.
7. Remove neither failed evidence nor superseded decisions; preserve the audit trail.

## Active milestone detail

### M0 — Decisions and baseline

**Objective:** establish a reproducible project shell and measure the intended
exhibition environment.

**Status:** Complete

**Dependencies:** target hardware information

#### Work checklist

- [x] Confirm target or representative computer.
- [x] Confirm camera model.
- [x] Confirm screen resolution and orientation.
- [x] Select and pin the provisional exhibition browser.
- [x] Decide visitor start method.
- [x] Initialize strict TypeScript and Vite application.
- [x] Add linting and formatting.
- [x] Add unit-test runner.
- [x] Add Playwright smoke test.
- [x] Add CI checks.
- [x] Add build version identifier.
- [x] Build browser/hardware capability report.
- [x] Verify the production bundle makes no external requests.
- [x] Confirm required capability checks visually on Target A.
- [x] Confirm audio playback after visitor interaction.
- [x] Confirm localhost camera permission persists after Chrome restart.

#### Files

- [`package.json`](../../package.json) — pinned runtime dependencies and verification commands.
- [`src/main.tsx`](../../src/main.tsx) — React application bootstrap.
- [`src/app/App.tsx`](../../src/app/App.tsx) — M0 target profile and capability dashboard.
- [`src/platform/capabilities.ts`](../../src/platform/capabilities.ts) — browser capability collection.
- [`src/app/HardwareChecks.tsx`](../../src/app/HardwareChecks.tsx) — local camera and audio verification controls.
- [`hardware-baseline.md`](./hardware-baseline.md) — provisional hardware decisions and assumptions.

#### Tests

- [`src/platform/capabilities.test.ts`](../../src/platform/capabilities.test.ts)
- [`src/app/HardwareChecks.test.tsx`](../../src/app/HardwareChecks.test.tsx)
- [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts)

#### Verification evidence

- [`verification/m0-baseline.md`](./verification/m0-baseline.md)

#### Open inputs

| Input | Owner | Status | Effect |
|---|---|---|---|
| Exhibition computer specification | Project owner | Provisional baseline recorded | Must be revisited if hardware changes |
| Camera model | Project owner | Integrated camera selected | Field of view requires M1 validation |
| Display dimensions/orientation | Project owner | Landscape laptop profile recorded | Final booth display remains provisional |
| Visitor start method | Project owner | Camera presence selected | Dwell/cooldown tuning waits for M2–M5 |
| Chrome permission persistence | Project owner + developer | Passed | EV-M0-015 |
| Audio interaction check | Project owner + developer | Passed | EV-M0-016 |
| Final booth television | Project owner | Deferred | Create Target B profile when model and dimensions are known |

#### Exit gate

See M0 in [ROADMAP.md](./ROADMAP.md). Completion evidence will be recorded here.

## Verification log

Record checks that were actually run. A command existing in `package.json` is not
evidence that it passed.

| Date | Evidence ID | Milestone | Check | Environment | Result | Artifact or notes |
|---|---|---|---|---|---|---|
| 2026-07-24 | EV-M0-001 | M0 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | `npm run typecheck` |
| 2026-07-24 | EV-M0-002 | M0 | ESLint analysis | Target A / Node 24.13.1 | Passed | `npm run lint` |
| 2026-07-24 | EV-M0-003 | M0 | Capability unit suite | jsdom / Vitest 4.1.0 | Passed | 2 tests |
| 2026-07-24 | EV-M0-004 | M0 | Production build | Target A / Vite 8.0.13 | Passed | Compiled bundle in `dist/` |
| 2026-07-24 | EV-M0-005 | M0 | Chrome smoke test | Chrome 150 / Target A | Passed | 1 Playwright test |
| 2026-07-24 | EV-M0-006 | M0 | External-request guard | Chrome 150 / Target A | Passed | No non-loopback request |
| 2026-07-24 | EV-M0-007–010 | M0 | Read-only device baseline | Target A | Passed | See verification report |
| 2026-07-24 | EV-M0-011 | M0 | Visual browser capability review | Chrome 150 / Target A | Passed | Project owner confirmed all 8 capability cards green |
| 2026-07-24 | EV-M0-012 | M0 | Camera diagnostic lifecycle suite | jsdom / Vitest 4.1.0 | Passed | Start, explicit stop, unmount cleanup, and permission denial covered |
| 2026-07-24 | EV-M0-013–016 | M0 | Physical camera, permission, and audio checks | Chrome 150 / Target A | Passed | Project-owner confirmation |
| 2026-07-24 | EV-M0-017 | M0 | Provisional display decision | Target A | Passed | Laptop selected; television deferred |
| 2026-07-26 | EV-M1-001 | M1 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 1 |
| 2026-07-26 | EV-M1-002 | M1 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 1 |
| 2026-07-26 | EV-M1-003 | M1 | Unit suite | jsdom / Vitest 4.1.0 | Passed | 20 tests across 5 files |
| 2026-07-26 | EV-M1-004 | M1 | Production build | Target A / Vite 8.0.13 | Passed | Increment 1 |
| 2026-07-26 | EV-M1-005 | M1 | M0/M1 navigation smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-26 | EV-M1-006 | M1 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 2 |
| 2026-07-26 | EV-M1-007 | M1 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 2 |
| 2026-07-26 | EV-M1-008 | M1 | Unit suite | jsdom / Vitest 4.1.0 | Passed | 35 tests across 7 files |
| 2026-07-26 | EV-M1-009 | M1 | Production build | Target A / Vite 8.0.13 | Passed | Increment 2 |
| 2026-07-26 | EV-M1-010 | M1 | Existing navigation smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-26 | EV-M1-011 | M1 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 3 |
| 2026-07-26 | EV-M1-012 | M1 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 3 |
| 2026-07-26 | EV-M1-013 | M1 | Unit suite | jsdom / Vitest 4.1.0 | Passed | 54 tests across 10 files |
| 2026-07-26 | EV-M1-014 | M1 | Production build | Target A / Vite 8.0.13 | Passed | Increment 3 |
| 2026-07-26 | EV-M1-015 | M1 | Existing navigation smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-26 | EV-M1-016 | M1 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 4 |
| 2026-07-26 | EV-M1-017 | M1 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 4 |
| 2026-07-26 | EV-M1-018 | M1 | Unit suite | jsdom / Vitest 4.1.0 | Passed | 58 tests across 11 files |
| 2026-07-26 | EV-M1-019 | M1 | Production build | Target A / Vite 8.0.13 | Passed | Increment 4 |
| 2026-07-26 | EV-M1-020 | M1 | Camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-28 | EV-M1-021 | M1 | Live camera laboratory physical review | Chrome 150 / Target A | Passed | Project owner confirmed preview, diagnostics, restart, stop, navigation cleanup, and preference checks |
| 2026-07-28 | EV-M1-022 | M1 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 5 |
| 2026-07-28 | EV-M1-023 | M1 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 5 |
| 2026-07-28 | EV-M1-024 | M1 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 63 tests across 12 files |
| 2026-07-28 | EV-M1-025 | M1 | Production build | Target A / Vite 8.0.13 | Passed | Increment 5 |
| 2026-07-28 | EV-M1-026 | M1 | Camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-28 | EV-M1-027 | M1 | Positioning and recovery physical review | Chrome 150 / Target A | Passed | Project owner confirmed guide, 1–2 m framing, aspect ratio, stop/restart, permission denial, and restored capture |
| 2026-07-28 | EV-M1-028 | M1 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 6 |
| 2026-07-28 | EV-M1-029 | M1 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 6 |
| 2026-07-28 | EV-M1-030 | M1 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 66 tests across 13 files; includes 50 start/stop cycles and 100 closed tracks |
| 2026-07-28 | EV-M1-031 | M1 | Production build | Target A / Vite 8.0.13 | Passed | Increment 6 |
| 2026-07-28 | EV-M1-032 | M1 | Camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-30 | EV-M2-001 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 1 |
| 2026-07-30 | EV-M2-002 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 1 |
| 2026-07-30 | EV-M2-003 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 70 tests across 14 files |
| 2026-07-30 | EV-M2-004 | M2 | Production build and local WASM copy | Target A / Vite 8.0.13 | Passed | Increment 1 |
| 2026-07-30 | EV-M2-005 | M2 | Existing camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-30 | EV-M2-006 | M2 | Live Pose Lite and two-hand overlay | Chrome / Target A | Passed | Project owner confirmed working overlay; detailed performance measurements pending |
| 2026-07-30 | EV-M2-007 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 2 |
| 2026-07-30 | EV-M2-008 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 2 |
| 2026-07-30 | EV-M2-009 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 80 tests across 16 files |
| 2026-07-30 | EV-M2-010 | M2 | Production build and local WASM copy | Target A / Vite 8.0.13 | Passed | Increment 2 |
| 2026-07-30 | EV-M2-011 | M2 | Existing camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-30 | EV-M2-012 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 3 |
| 2026-07-30 | EV-M2-013 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 3 |
| 2026-07-30 | EV-M2-014 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 85 tests across 17 files |
| 2026-07-30 | EV-M2-015 | M2 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Separate `vision.worker-*.js` emitted |
| 2026-07-30 | EV-M2-016 | M2 | Existing camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-30 | EV-M2-017 | M2 | Physical worker inference and overlay review | Chrome / Target A | Passed | Project owner confirmed worker GPU badge plus live Pose Lite body and two-hand overlays |
| 2026-07-30 | EV-M2-018 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 4 |
| 2026-07-30 | EV-M2-019 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 4 |
| 2026-07-30 | EV-M2-020 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 91 tests across 19 files |
| 2026-07-30 | EV-M2-021 | M2 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Increment 4 |
| 2026-07-30 | EV-M2-022 | M2 | Existing camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-30 | EV-M2-023 | M2 | Short-run worker performance review | Chrome / Target A | Passed with performance follow-up | 20.4 FPS; inference p95 76.1 ms; capture p95 100.6 ms; replacement rate 44.4% |
| 2026-07-30 | EV-M2-024 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 5 |
| 2026-07-30 | EV-M2-025 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 5 |
| 2026-07-30 | EV-M2-026 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 98 tests across 20 files |
| 2026-07-30 | EV-M2-027 | M2 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Increment 5 |
| 2026-07-30 | EV-M2-028 | M2 | Existing camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-30 | EV-M2-029 | M2 | Physical presence, framing, and tracking-quality review | Chrome / Target A | Passed | Project owner confirmed all expected empty-zone, intended-distance, near/far, hand-loss, and partial-frame classifications |
| 2026-07-30 | EV-M2-030 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 6A |
| 2026-07-30 | EV-M2-031 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 6A |
| 2026-07-30 | EV-M2-032 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 104 tests across 21 files |
| 2026-07-30 | EV-M2-033 | M2 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Increment 6A |
| 2026-07-30 | EV-M2-034 | M2 | Existing camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-30 | EV-M2-035 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 6B |
| 2026-07-30 | EV-M2-036 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 6B |
| 2026-07-30 | EV-M2-037 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 109 tests across 22 files |
| 2026-07-30 | EV-M2-038 | M2 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Increment 6B |
| 2026-07-30 | EV-M2-039 | M2 | Existing camera laboratory smoke suite | Chrome 150 / Target A | Passed | 2 Playwright tests |
| 2026-07-30 | EV-M2-040 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 6C |
| 2026-07-30 | EV-M2-041 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 6C |
| 2026-07-30 | EV-M2-042 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 112 tests across 23 files |
| 2026-07-30 | EV-M2-043 | M2 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Increment 6C |
| 2026-07-30 | EV-M2-044 | M2 | M0/M1/M2 navigation and replay smoke suite | Chrome 150 / Target A | Passed | 3 Playwright tests; replay requested no camera |
| 2026-07-30 | EV-M2-045 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 6D |
| 2026-07-30 | EV-M2-046 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 6D |
| 2026-07-30 | EV-M2-047 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 113 tests across 23 files |
| 2026-07-30 | EV-M2-048 | M2 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Increment 6D |
| 2026-07-30 | EV-M2-049 | M2 | M0/M1/M2 navigation smoke suite | Chrome 150 / Target A | Passed | 3 Playwright tests |
| 2026-07-31 | EV-M2-050 | M2 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Increment 7 |
| 2026-07-31 | EV-M2-051 | M2 | ESLint analysis | Target A / Node 24.13.1 | Passed | Increment 7 |
| 2026-07-31 | EV-M2-052 | M2 | Unit and component suite | jsdom / Vitest 4.1.0 | Passed | 117 tests across 24 files |
| 2026-07-31 | EV-M2-053 | M2 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Increment 7 |
| 2026-07-31 | EV-M2-054 | M2 | M0/M1/M2 navigation smoke suite | Chrome 150 / Target A | Passed | 3 Playwright tests |
| 2026-07-31 | EV-M2-055 | M2 | 640 px inference-input physical comparison | Chrome 150 / Target A, 1–2 metre zone | Passed | Capture p95 93.5 ms; body, two-hand, crossed-hand, finger, and alignment checks passed |
| 2026-08-03 | EV-M3-001 | M3 | Python edge-trimming and fixture unit tests | Python 3.12.13 | Passed | 4 tests; includes internal-pause preservation |
| 2026-08-03 | EV-M3-002 | M3 | Real Opening Door slow-video extraction | MediaPipe 0.10.35 / OpenCV | Passed | 156 frames; 8267 ms source; retained 0–7767 ms |
| 2026-08-03 | EV-M3-003 | M3 | Replay provenance validator tests | Target A / Vitest 4.1.0 | Passed | 8 focused tests; 119 total tests across 24 files |
| 2026-08-03 | EV-M3-004 | M3 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Fixture extraction increment 1 |
| 2026-08-03 | EV-M3-005 | M3 | ESLint analysis | Target A / Node 24.13.1 | Passed | `.venv` excluded from JavaScript lint scope |
| 2026-08-03 | EV-M3-006 | M3 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Existing MediaPipe build warnings unchanged |
| 2026-08-03 | EV-M3-007 | M3 | Local fixture loader component tests | Target A / Vitest 4.1.0 | Passed | Valid fixture, metadata, and invalid JSON cases covered |
| 2026-08-03 | EV-M3-008 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 121 tests across 24 files |
| 2026-08-03 | EV-M3-009 | M3 | Strict TypeScript check and ESLint | Target A / Node 24.13.1 | Passed | Fixture visualization increment 2 |
| 2026-08-03 | EV-M3-010 | M3 | Production build and worker bundle | Target A / Vite 8.0.13 | Passed | Existing MediaPipe build warnings unchanged |
| 2026-08-03 | EV-M3-011 | M3 | Existing M0–M2 browser smoke suite | Chrome 150 / Target A | Passed | 3 Playwright tests |
| 2026-08-03 | EV-M3-012 | M3 | Real Opening Door fixture browser replay | Chrome / Target A | Passed | Loaded 4 MB JSON; 156/156 frames; pose and both hands rendered; metadata matched extraction |
| 2026-08-03 | EV-M3-013 | M3 | Project-owner Opening Door slow-fixture review | Chrome / Target A | Passed | Complete pilot replay and landmark visualization confirmed visually |
| 2026-08-03 | EV-M3-014 | M3 | Python fixture and batch tests | Target A / Python virtual environment | Passed | 7 tests including manifest validation and QA report generation |
| 2026-08-03 | EV-M3-015 | M3 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Practitioner fixture batch increment 3 |
| 2026-08-03 | EV-M3-016 | M3 | ESLint analysis | Target A / Node 24.13.1 | Passed | Practitioner fixture batch increment 3 |
| 2026-08-03 | EV-M3-017 | M3 | Curated practitioner batch extraction | Target A / Python virtual environment | Passed | 9/9 front-facing fixtures generated; motion detected in every sequence |
| 2026-08-03 | EV-M3-018 | M3 | Project-owner curated fixture visual QA | Chrome / Target A | Passed with constraint | All 9 fixtures approved; Water Sleeves has unreliable or unavailable hand detection, so hands are optional for that gesture |
| 2026-08-03 | EV-M3-019 | M3 | Water Sleeves feature unit tests | Target A / Vitest 4.1.0 | Passed | Covers normalization, occlusion, per-arm availability, hand independence, and body-scale rejection |
| 2026-08-03 | EV-M3-020 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | Water Sleeves feature foundation increment 4 |
| 2026-08-03 | EV-M3-021 | M3 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | Water Sleeves feature foundation increment 4 |
| 2026-08-03 | EV-M3-022 | M3 | ESLint analysis | Target A / Node 24.13.1 | Passed | Water Sleeves feature foundation increment 4 |
| 2026-08-03 | EV-M3-023 | M3 | Production build | Target A / Vite 8.0.13 | Passed | Existing MediaPipe build warnings unchanged |
| 2026-08-03 | EV-M3-024 | M3 | Water Sleeves feature-panel component tests | Target A / Vitest 4.1.0 | Passed | Covers idle policy, pose-only measurements, and wrist occlusion |
| 2026-08-03 | EV-M3-025 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 129 tests across 26 files |
| 2026-08-03 | EV-M3-026 | M3 | Strict TypeScript check and ESLint | Target A / Node 24.13.1 | Passed | Water Sleeves feature observability increment 5 |
| 2026-08-03 | EV-M3-027 | M3 | Production build | Target A / Vite 8.0.13 | Passed | Existing MediaPipe build warnings unchanged |
| 2026-08-03 | EV-M3-028 | M3 | Real sleeved fixture feature replay | Local browser / Target A | Passed | Both pose arms remained observable while hand influence stayed at none; no browser errors |
| 2026-08-03 | EV-M3-029 | M3 | Water Sleeves trajectory unit tests | Target A / Vitest 4.1.0 | Passed | Covers normalized progress, coverage, missing frames, and conservative signal recommendations |
| 2026-08-03 | EV-M3-030 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | Water Sleeves temporal trajectory increment 6 |
| 2026-08-03 | EV-M3-031 | M3 | Strict TypeScript check and ESLint | Target A / Node 24.13.1 | Passed | Water Sleeves temporal trajectory increment 6 |
| 2026-08-03 | EV-M3-032 | M3 | Production build | Target A / Vite 8.0.13 | Passed | Existing MediaPipe build warnings unchanged |
| 2026-08-03 | EV-M3-033 | M3 | Real with-sleeves trajectory coverage | Local browser / Target A | Passed | 155/155 usable; core pose signals 92.9–100%; wrist and elbow-angle signals optional |
| 2026-08-03 | EV-M3-034 | M3 | Real without-sleeves trajectory coverage | Local browser / Target A | Passed | 145/145 usable; pose coverage 100%; wrist and elbow-angle signals optional |
| 2026-08-03 | EV-M3-035 | M3 | Water Sleeves envelope unit tests | Target A / Vitest 4.1.0 | Passed | Covers deterministic resampling, circular smoothing, tolerance fit, and invalid point counts |
| 2026-08-03 | EV-M3-036 | M3 | Committed Water Sleeves reference tests | Target A / Vitest 4.1.0 | Passed | 41 image-free points with complete required targets and source provenance |
| 2026-08-03 | EV-M3-037 | M3 | Canonical with-sleeves envelope comparison | Target A / local fixture | Passed | 100% fixed-progress developer fit across all required signals |
| 2026-08-03 | EV-M3-038 | M3 | Supporting no-sleeves envelope comparison | Target A / local fixture | Observed | 80.5% overall; per-signal fit 65.9–100% |
| 2026-08-03 | EV-M3-039 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | Water Sleeves envelope increment 7 |
| 2026-08-03 | EV-M3-040 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Water Sleeves envelope increment 7 |
| 2026-08-03 | EV-M3-041 | M3 | Real fixture envelope display | Local browser / Target A | Passed | Canonical and supporting comparisons rendered with no browser errors |
| 2026-08-03 | EV-M3-042 | M3 | Water Sleeves temporal evaluator unit tests | Target A / Vitest 4.1.0 | Passed | Covers timing variation, short/prolonged dropout, altered paths, and empty input |
| 2026-08-03 | EV-M3-043 | M3 | Canonical sleeved temporal evaluation | Local browser / Target A | Observed | 98.9% soft score; 96.5% required-signal coverage; good tracking |
| 2026-08-03 | EV-M3-044 | M3 | Supporting no-sleeves temporal evaluation | Local browser / Target A | Observed | 90.1% soft score; 100% required-signal coverage; good tracking |
| 2026-08-03 | EV-M3-045 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | Water Sleeves temporal evaluator increment 8 |
| 2026-08-03 | EV-M3-046 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Water Sleeves temporal evaluator increment 8 |
| 2026-08-03 | EV-M3-047 | M3 | Real fixture temporal-evaluator display | Local browser / Target A | Passed | Canonical and supporting diagnostics rendered with no browser errors |
| 2026-08-03 | EV-M3-048 | M3 | Water Sleeves deterministic regression suite | Target A / Vitest 4.1.0 | Passed | Eight image-free scenarios met documented score and tracking bounds |
| 2026-08-03 | EV-M3-049 | M3 | Movement-versus-tracking separation | Target A / Vitest 4.1.0 | Passed | Wrong movements remain good tracking; prolonged occlusion is insufficient |
| 2026-08-03 | EV-M3-050 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | Water Sleeves deterministic regressions increment 9 |
| 2026-08-03 | EV-M3-051 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Water Sleeves deterministic regressions increment 9 |
| 2026-08-03 | EV-M3-052 | M3 | Regression laboratory table | Local browser / Target A | Passed | Eight scenarios rendered as passing with no browser errors |
| 2026-08-03 | EV-M3-053 | M3 | Live Water Sleeves attempt-buffer tests | Target A / Vitest 4.1.0 | Passed | Seven lifecycle, tracking, bounded-memory, timestamp, and validation cases |
| 2026-08-03 | EV-M3-054 | M3 | Shared Water Sleeves trajectory regressions | Target A / Vitest 4.1.0 | Passed | Replay and live capture produce the same trajectory contract |
| 2026-08-03 | EV-M3-055 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | Live attempt buffer increment 10 |
| 2026-08-03 | EV-M3-056 | M3 | Strict TypeScript check and ESLint | Target A / Node 24.13.1 | Passed | Live attempt buffer increment 10 |
| 2026-08-03 | EV-M3-057 | M3 | Production build | Target A / Vite 8.0.13 | Passed | Existing MediaPipe build warnings unchanged |
| 2026-08-03 | EV-M3-058 | M3 | Live scoring hook and panel component tests | Target A / Vitest 4.1.0 | Passed | Worker-frame capture, evaluation, session reset, controls, diagnostics, and no-threshold messaging covered |
| 2026-08-03 | EV-M3-059 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 168 tests across 35 files |
| 2026-08-03 | EV-M3-060 | M3 | Strict TypeScript check and ESLint | Target A / Node 24.13.1 | Passed | Live Water Sleeves scoring increment 11 |
| 2026-08-03 | EV-M3-061 | M3 | Production build | Target A / Vite 8.0.13 | Passed | Existing MediaPipe build warnings unchanged |
| 2026-08-03 | EV-M3-062 | M3 | Compact practitioner reference-guide playback | Target A / Vitest 4.1.0 | Passed | 41 pose-only frames loop at normal pace and restart manually or with a new attempt |
| 2026-08-04 | EV-M3-063 | M3 | Water Sleeves tuning-analysis tests | Target A / Vitest 4.1.0 | Passed | Separation, overlap, minimum sample count, and tracking exclusion covered |
| 2026-08-04 | EV-M3-064 | M3 | Tuning-session component tests | Target A / Vitest 4.1.0 | Passed | Attempt labelling, relabelling, score ranges, and disabled state covered |
| 2026-08-04 | EV-M3-065 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 173 tests across 37 files |
| 2026-08-04 | EV-M3-066 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Tuning increment 12 |
| 2026-08-04 | EV-M3-067 | M3 | M0–M2 browser smoke suite | Target A / Playwright | Passed | 3 tests; exact fixture selector CI repair retained |
| 2026-08-04 | EV-M3-068 | M3 | Automatic attempt-boundary state-machine tests | Target A / Vitest 4.1.0 | Passed | Countdown, sustained onset, internal pause, stillness completion, and cancellation covered |
| 2026-08-04 | EV-M3-069 | M3 | Live scoring integration tests | Target A / Vitest 4.1.0 | Passed | Automatic capture feeds the existing trajectory evaluator and resets across camera sessions |
| 2026-08-04 | EV-M3-070 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 176 tests across 38 files |
| 2026-08-04 | EV-M3-071 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Automatic attempt capture increment 13 |
| 2026-08-04 | EV-M3-072 | M3 | M0–M2 browser smoke suite | Target A / Playwright | Passed | 3 tests |
| 2026-08-04 | EV-M3-073 | M3 | Automatic attempt-boundary physical review | Target A / integrated camera | Passed | Countdown, ready-state stability, onset, internal pause, stillness completion, mouse return, manual finish, cancel, and no-movement behavior approved by project owner |
| 2026-08-04 | EV-M3-074 | M3 | Labelled Water Sleeves physical tuning session | Chrome / Target A | Passed with capture-timing follow-up | Correct 81.6–85.9%; partial 48.6–67.0%; incorrect 42.4–54.6%; provisional midpoint 68.1% not adopted |
| 2026-08-04 | EV-M3-075 | M3 | Fixed-start and stillness-completion tests | Target A / Vitest 4.1.0 | Passed | Five-second countdown, immediate recording, 0.8-second stillness, internal-pause preservation, and live scoring integration covered |
| 2026-08-04 | EV-M3-076 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 179 tests across 38 files, including initial-stillness completion guard |
| 2026-08-04 | EV-M3-077 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Capture tuning increment 14; existing MediaPipe build warnings unchanged |
| 2026-08-04 | EV-M3-078 | M3 | Tuned Water Sleeves physical flow review | Chrome / Target A | Passed with moderate accuracy | Project owner approved five-second fixed start, early-hesitation guard, and automatic final hold for continued development |
| 2026-08-04 | EV-M3-079 | M3 | Shared scoring contract tests | Target A / Vitest 4.1.0 | Passed | Canonical gesture metadata, typed lookup, and gesture-independent evaluator shape covered |
| 2026-08-04 | EV-M3-080 | M3 | Water Sleeves contract compatibility | Target A / Vitest 4.1.0 | Passed | Existing evaluator and tuning behavior retained through shared types |
| 2026-08-04 | EV-M3-081 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 182 tests across 39 files |
| 2026-08-04 | EV-M3-082 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Shared scoring contract increment 15; existing MediaPipe build warnings unchanged |
| 2026-08-04 | EV-M3-083 | M3 | Opening Door normalized feature tests | Target A / Vitest 4.1.0 | Passed | 5 tests cover scale/translation invariance, pose-wrist hand association, missing hands/wrists, and invalid body scale |
| 2026-08-04 | EV-M3-084 | M3 | Strict TypeScript and ESLint | Target A / Node 24.13.1 | Passed | Opening Door feature contract increment 16 |
| 2026-08-04 | EV-M3-085 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 187 tests across 40 files |
| 2026-08-04 | EV-M3-086 | M3 | Production build | Target A / Vite 8.0.13 | Passed | Existing MediaPipe build warnings unchanged |
| 2026-08-04 | EV-M3-087 | M3 | Opening Door trajectory coverage tests | Target A / Vitest 4.1.0 | Passed | Required pose and optional hand coverage classification covered |
| 2026-08-04 | EV-M3-088 | M3 | Multi-take Opening Door envelope tests | Target A / Vitest 4.1.0 | Passed | Median aggregation, compact provenance, and invalid input guards covered |
| 2026-08-04 | EV-M3-089 | M3 | Real two-take Opening Door reference generation | Target A / local practitioner fixtures | Passed | 41 points; take 1 pose/hand coverage 100.0%/83.4%; take 2 100.0%/97.7% |
| 2026-08-04 | EV-M3-090 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 193 tests across 43 files |
| 2026-08-04 | EV-M3-091 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Opening Door reference increment 17; existing MediaPipe build warnings unchanged |
| 2026-08-04 | EV-M3-092 | M3 | Opening Door canonical and tempo-alignment tests | Target A / Vitest 4.1.0 | Passed | Canonical reconstruction and stretched timing score strongly |
| 2026-08-04 | EV-M3-093 | M3 | Opening Door optional-hand and tracking tests | Target A / Vitest 4.1.0 | Passed | Missing optional hands preserve pose score; missing required pose is insufficient |
| 2026-08-04 | EV-M3-094 | M3 | Opening Door displaced-path negative | Target A / Vitest 4.1.0 | Passed | Fully tracked two-shoulder-width displacement scores below 20% |
| 2026-08-04 | EV-M3-095 | M3 | Real Opening Door fixture evaluation | Target A / local practitioner fixtures | Passed | Normal takes 95.0% and 95.3%; slow diagnostic take 92.6% |
| 2026-08-04 | EV-M3-096 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 198 tests across 44 files |
| 2026-08-04 | EV-M3-097 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Opening Door evaluator increment 18; existing MediaPipe build warnings unchanged |
| 2026-08-04 | EV-M3-098 | M3 | Live Opening Door scoring hook | Target A / Vitest 4.1.0 | Passed | Fixed countdown, worker-frame collection, evaluation, and camera-session reset covered |
| 2026-08-04 | EV-M3-099 | M3 | Opening Door guide playback | Target A / Vitest 4.1.0 | Passed | Guide holds during countdown and advances with pose and hand landmarks after recording starts |
| 2026-08-04 | EV-M3-100 | M3 | Camera-lab gesture selection | Target A / Testing Library | Passed | Water Sleeves and Opening Door panels and guides switch without sharing attempt state |
| 2026-08-04 | EV-M3-101 | M3 | Focused live Opening Door integration suite | Target A / Vitest 4.1.0 | Passed | 10 tests across hook, guide, and camera page |
| 2026-08-04 | EV-M3-102 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 201 tests across 46 files |
| 2026-08-04 | EV-M3-103 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Live Opening Door increment 19; existing MediaPipe and bundle-size warnings remain |
| 2026-08-04 | EV-M3-104 | M3 | Live Opening Door physical flow review | Chrome / Target A | Passed | Project owner confirmed selector, guide, countdown, normal and slow attempt completion, score display, and Water Sleeves return path |
| 2026-08-04 | EV-M3-105 | M3 | Orchid Finger normalized feature tests | Target A / Vitest 4.1.0 | Passed | Scale/translation invariance, wrist-based hand association, missing-hand fallback, and invalid body scale covered |
| 2026-08-04 | EV-M3-106 | M3 | Orchid Finger shape-relationship tests | Target A / Vitest 4.1.0 | Passed | Extended-versus-curled fingers and thumb-to-fingertip contact remain explicit |
| 2026-08-04 | EV-M3-107 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 206 tests across 47 files |
| 2026-08-04 | EV-M3-108 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Orchid Finger feature increment 20; existing MediaPipe and bundle-size warnings remain |
| 2026-08-04 | EV-M3-109 | M3 | Orchid Finger fixture coverage analysis | Target A / three normal practitioner takes | Passed | Pose and at-least-one-hand coverage are 100.0% in every normal take; slow take retained as diagnostic only |
| 2026-08-04 | EV-M3-110 | M3 | Orchid Finger trajectory and coverage tests | Target A / Vitest 4.1.0 | Passed | Required body and optional/excluded hand evidence classification covered |
| 2026-08-04 | EV-M3-111 | M3 | Orchid Finger envelope and artifact tests | Target A / Vitest 4.1.0 | Passed | Three-take aggregation, finger relationships, 41-point contract, and absence of frames, landmarks, and pixels covered |
| 2026-08-04 | EV-M3-112 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 212 tests across 50 files |
| 2026-08-04 | EV-M3-113 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Orchid Finger trajectory and reference increment 21; existing MediaPipe and bundle-size warnings remain |
| 2026-08-04 | EV-M3-114 | M3 | Orchid Finger canonical and time-stretched evaluation | Target A / Vitest 4.1.0 | Passed | Canonical reference exceeds 98%; dynamic time warping preserves greater than 90% for duplicated slower samples |
| 2026-08-04 | EV-M3-115 | M3 | Orchid Finger evidence handling | Target A / Vitest 4.1.0 | Passed | Missing hand evidence remains unscored while missing required pose tracking is insufficient |
| 2026-08-04 | EV-M3-116 | M3 | Orchid Finger negative shape discrimination | Target A / Vitest 4.1.0 | Passed | Fully visible but displaced finger relationships reduce hand-shape and overall similarity |
| 2026-08-04 | EV-M3-117 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 217 tests across 51 files |
| 2026-08-04 | EV-M3-118 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Orchid Finger evaluator increment 22; existing MediaPipe and bundle-size warnings remain |
| 2026-08-04 | EV-M3-119 | M3 | Live Orchid Finger scoring hook | Target A / Vitest 4.1.0 | Passed | Fixed countdown, worker-frame collection, evaluation, and camera-session reset covered |
| 2026-08-04 | EV-M3-120 | M3 | Orchid Finger guide playback | Target A / Vitest 4.1.0 | Passed | Guide holds during countdown and begins pose-and-hand playback with recording |
| 2026-08-04 | EV-M3-121 | M3 | Three-gesture camera-lab selection | Target A / Testing Library | Passed | Water Sleeves, Opening Door, and Orchid Finger tools switch without sharing attempt state |
| 2026-08-04 | EV-M3-122 | M3 | Focused live Orchid Finger integration suite | Target A / Vitest 4.1.0 | Passed | 10 tests across hook, guide, and camera page |
| 2026-08-04 | EV-M3-123 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 225 tests across 54 files after capture-timing verification fixes |
| 2026-08-04 | EV-M3-124 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Live Orchid Finger increment 23; existing MediaPipe and bundle-size warnings remain |
| 2026-08-04 | EV-M3-125 | M3 | Live Orchid Finger physical capture review | Chrome / Target A | Passed | Project owner confirmed first-loop minimum, palm-based stillness detection, two-second final hold, and automatic completion work in the live camera flow |
| 2026-08-04 | EV-M3-126 | M3 | Per-gesture first-cycle configuration | Target A / Vitest 4.1.0 | Passed | Water Sleeves 7.7s, Opening Door 8.7s, and Orchid Finger 15.6s minimums covered |
| 2026-08-04 | EV-M3-127 | M3 | High-rate buffer protection | Target A / Vitest 4.1.0 | Passed | Water Sleeves and Opening Door buffers exceed a full cycle at 60 FPS; Orchid Finger retains its approved 1,200-frame limit |
| 2026-08-04 | EV-M3-128 | M3 | Focused automatic-capture and live-hook suite | Target A / Vitest 4.1.0 | Passed | 13 tests across 4 files |
| 2026-08-04 | EV-M3-129 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 227 tests across 54 files |
| 2026-08-04 | EV-M3-130 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | First-reference-cycle protection increment 24; existing MediaPipe and bundle-size warnings remain |
| 2026-08-04 | EV-M3-131 | M3 | First-reference-cycle physical review | Chrome / Target A | Passed | Project owner confirmed Water Sleeves and Opening Door remain active through their complete first reference cycle; Orchid Finger previously approved in EV-M3-125 |
| 2026-08-04 | EV-M3-132 | M3 | Stationary Water Sleeves rejection | Target A / Vitest 4.1.0 | Passed | Fully tracked held pose has zero movement completeness and zero overall score |
| 2026-08-04 | EV-M3-133 | M3 | Reduced-range movement penalty | Target A / Vitest 4.1.0 | Passed | 35% arm excursion produces less than 50% completeness and overall similarity |
| 2026-08-04 | EV-M3-134 | M3 | Canonical, speed, dropout, and negative regression | Target A / Vitest 4.1.0 | Passed | Existing dynamic time warping behavior remains covered |
| 2026-08-04 | EV-M3-135 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 230 tests across 54 files after stationary-completion fix |
| 2026-08-04 | EV-M3-136 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Water Sleeves completeness increment 25; existing MediaPipe and bundle-size warnings remain |
| 2026-08-04 | EV-M3-137 | M3 | Water Sleeves stationary physical review | Chrome / Target A | Passed | Stationary score reduced from 73.1% to 8.3%; project owner confirmed first-cycle protection and jitter-tolerant automatic completion work without waiting for the 20-second safety timeout |
| 2026-08-04 | EV-M3-138 | M3 | Stationary Opening Door rejection | Target A / Vitest 4.1.0 | Passed | Fully tracked held pose has zero movement completeness and zero overall score |
| 2026-08-04 | EV-M3-139 | M3 | Reduced-range Opening Door penalty | Target A / Vitest 4.1.0 | Passed | 35% arm-path excursion produces less than 50% completeness and overall similarity |
| 2026-08-04 | EV-M3-140 | M3 | Opening Door evaluator regression | Target A / Vitest 4.1.0 | Passed | Canonical, slower, optional-hand, displaced-path, and insufficient-pose cases retained |
| 2026-08-04 | EV-M3-141 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 232 tests across 54 files |
| 2026-08-04 | EV-M3-142 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Opening Door completeness increment 26; existing MediaPipe and bundle-size warnings remain |
| 2026-08-05 | EV-M3-143 | M3 | Opening Door physical discrimination review | Chrome / Target A | Passed | Stationary: 2.2% overall, 4.3% completeness, 8.8s automatic completion; sincere: 72.9% overall, 100.0% completeness, 8.7s automatic completion |
| 2026-08-05 | EV-M3-144 | M3 | Stationary Orchid Finger rejection | Target A / Vitest 4.1.0 | Passed | Fully tracked held pose with visible finger shape has zero movement completeness and overall score |
| 2026-08-05 | EV-M3-145 | M3 | Reduced-range Orchid Finger penalty | Target A / Vitest 4.1.0 | Passed | 35% arm and palm excursion produces less than 50% completeness and overall similarity |
| 2026-08-05 | EV-M3-146 | M3 | Orchid Finger evaluator regression | Target A / Vitest 4.1.0 | Passed | Canonical, slower, missing-hand, incorrect-shape, and insufficient-pose cases retained |
| 2026-08-05 | EV-M3-147 | M3 | Full unit and component suite | Target A / Vitest 4.1.0 | Passed | 235 tests across 54 files after robust endpoint-drift regression |
| 2026-08-05 | EV-M3-148 | M3 | TypeScript, ESLint, and production build | Target A / Node 24.13.1 | Passed | Orchid Finger completeness increment 27; existing MediaPipe and bundle-size warnings remain |
| 2026-08-05 | EV-M3-149 | M3 | Orchid Finger physical discrimination review | Chrome / Target A | Passed | Stationary: 2.2% overall, 2.7% completeness, 15.6s completion; sincere: 73.2% overall, 100.0% completeness, 15.6s completion |

Recommended evidence ID format: `EV-M2-001`.

Examples of valid evidence:

- test command and summarized result;
- target-device latency report;
- Playwright trace or screenshot;
- fixture names used for gesture regression;
- soak-test duration and observed resource bounds;
- recovery-drill checklist;
- cultural review approval;
- release checksum and version.

## Decision log

Use this table for small decisions. Create a full ADR under `docs/adr/` when the
decision affects multiple modules, changes deployment, is costly to reverse, or needs
substantial trade-off reasoning.

| Date | Decision ID | Milestone | Decision | Reason | Related files |
|---|---|---|---|---|---|
| 2026-07-24 | DEC-001 | Planning | Use incremental, exit-gated delivery | Prevent late integration failure | [`ROADMAP.md`](./ROADMAP.md) |
| 2026-07-24 | DEC-002 | Planning | Maintain one authoritative status ledger | Preserve capability-to-code traceability | [`DEVELOPMENT_STATUS.md`](./DEVELOPMENT_STATUS.md) |
| 2026-07-24 | DEC-003 | M0 | Use Google Chrome as provisional kiosk browser | Already installed, Chromium API support, predictable Windows kiosk mode | [`hardware-baseline.md`](./hardware-baseline.md) |
| 2026-07-24 | DEC-004 | M0 | Use sustained camera presence to enter welcome | Supports unmanned operation while limiting false starts | [`hardware-baseline.md`](./hardware-baseline.md) |
| 2026-07-24 | DEC-005 | M0 | Treat the laptop and integrated camera as Target A | Allows incremental hardware validation now | [`hardware-baseline.md`](./hardware-baseline.md) |
| 2026-07-26 | DEC-006 | Planning | Focus the experience on the female Dan role | Stakeholder direction narrows cultural and technical scope | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| 2026-07-26 | DEC-007 | Planning | Use Orchid Finger, door-opening actions, and water sleeves as the three interactions | Stakeholder-selected movement progression; canonical English name clarified by the project owner | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| 2026-07-26 | DEC-008 | Planning | Treat practitioner footage as canonical reference, not a sufficient training dataset | One expert reference does not represent visitor variation | [`practitioner-session-plan.md`](./practitioner-session-plan.md) |

Recommended decision ID format: `DEC-###`.

## Known issues and blockers

| Issue ID | First seen | Milestone | Severity | Status | Description | Related files |
|---|---|---|---|---|---|---|
| ISS-M2-001 | 2026-07-30 | M2 | S3 | Open | Initial Target A capture-to-result p95 was 100.6 ms; the 640 px tuning run improved it to 93.5 ms, but tracking-quality review and longer validation remain required | [`verification/m2-increment-4.md`](./verification/m2-increment-4.md), [`verification/m2-increment-7.md`](./verification/m2-increment-7.md) |
| ISS-M3-001 | 2026-08-04 | M3 | S3 | Open | Water Sleeves is functionally usable with moderate accuracy; tune all three gesture envelopes and thresholds together after Opening Door and Orchid Finger reach live scoring | [`verification/m3-water-sleeves-capture-tuning-14.md`](./verification/m3-water-sleeves-capture-tuning-14.md) |

Recommended issue ID format: `ISS-M2-001`.

Severity:

- `S1`: prevents exhibition operation or risks privacy/cultural harm;
- `S2`: blocks a milestone or major user path;
- `S3`: degraded behavior with a working recovery;
- `S4`: minor polish or maintainability issue.

## Cultural and content approvals

Technical completion does not imply cultural approval.

| Content ID | Item | Draft source | Reviewer | Status | Approved artifact |
|---|---|---|---|---|---|
| — | Story | Not supplied | Not assigned | Pending | — |
| ROLE-DAN | Female Dan role focus | Organisers / Kong Chow Wui Koon stakeholder consultation | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| GESTURE-01 | Orchid Finger | Stakeholder-selected | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| GESTURE-02 | Actions to open the door | Stakeholder-selected | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| GESTURE-03 | The water sleeves | Stakeholder-selected | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| COSTUME-01 | Physical Dan-role costume and water sleeves | Stakeholder rental offer | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| — | Narration and pronunciation | Not supplied | Not assigned | Pending | — |

Allowed approval values:

- `Pending`
- `Draft`
- `Under review`
- `Approved`
- `Changes requested`
- `Superseded`

## Release history

| Version | Date | Commit | Highest completed milestone | Target | Verification | Notes |
|---|---|---|---|---|---|---|
| — | — | — | None | — | — | No release built |

## Update protocol

Whenever implementation work is performed:

1. Set the relevant milestone to `In progress`.
2. Add or update capability-registry rows.
3. Add exact implementation and test-file links.
4. Run the appropriate verification.
5. Add the result to the verification log.
6. Record new decisions, blockers, and cultural dependencies.
7. Mark the capability complete only if its checks pass.
8. Mark the milestone complete only if every exit-gate condition passes.
9. Update `Current position` and `Last updated`.
10. Include the status-ledger changes in the same review/commit as the capability.

When a file is renamed, update its links here in the same change. When a test fails,
record the issue rather than silently leaving the previous verification looking
current.

## Status update template

Copy this section into the active milestone when starting a new capability:

```markdown
### CAPABILITY-ID — Short capability name

**Status:** In progress

**Purpose:** One sentence describing user or engineering value.

**Implementation**

- `path/to/source.ts` — responsibility

**Tests**

- `path/to/source.test.ts` — behavior covered

**Verification**

- Evidence ID:
- Environment:
- Command or procedure:
- Result:

**Known limitations**

- None, or explicit limitations.

**Next dependency**

- The next capability this unblocks.
```

## Git traceability convention

When Git commits begin, use the capability or milestone ID in commit subjects where
practical:

```text
M1: add camera lifecycle service
M1: handle device removal and bounded retry
M3: add raise-hand temporal evaluator
M5: connect one-gesture vertical slice
```

The ledger is the product-level source of truth; Git is the detailed change history.
Neither replaces the other.
