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
| M3 | Gesture scoring laboratory | In progress | 40% | [`verification/m3-fixture-extraction-1.md`](./verification/m3-fixture-extraction-1.md), [`verification/m3-fixture-visualization-2.md`](./verification/m3-fixture-visualization-2.md), [`verification/m3-fixture-batch-3.md`](./verification/m3-fixture-batch-3.md), [`verification/m3-water-sleeves-features-4.md`](./verification/m3-water-sleeves-features-4.md) |
| M4 | Gameplay state-machine simulator | Blocked by M0 | 0% | — |
| M5 | First vertical slice | Blocked by M2–M4 | 0% | — |
| M6 | Content pipeline | Blocked by M5 | 0% | — |
| M7 | Final gestures | Blocked by M3 and cultural input | 0% | — |
| M8 | Audio and visual experience | Blocked by M5–M7 | 0% | — |
| M9 | Kiosk hardening | Blocked by M8 | 0% | — |
| M10 | Exhibition validation and freeze | Blocked by M9 | 0% | — |

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
| 2026-07-26 | DEC-007 | Planning | Use Lotus Finger, door-opening actions, and water sleeves as the three interactions | Stakeholder-selected movement progression | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| 2026-07-26 | DEC-008 | Planning | Treat practitioner footage as canonical reference, not a sufficient training dataset | One expert reference does not represent visitor variation | [`practitioner-session-plan.md`](./practitioner-session-plan.md) |

Recommended decision ID format: `DEC-###`.

## Known issues and blockers

| Issue ID | First seen | Milestone | Severity | Status | Description | Related files |
|---|---|---|---|---|---|---|
| ISS-M2-001 | 2026-07-30 | M2 | S3 | Open | Initial Target A capture-to-result p95 was 100.6 ms; the 640 px tuning run improved it to 93.5 ms, but tracking-quality review and longer validation remain required | [`verification/m2-increment-4.md`](./verification/m2-increment-4.md), [`verification/m2-increment-7.md`](./verification/m2-increment-7.md) |

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
| GESTURE-01 | The Lotus Finger | Stakeholder-selected | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
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
