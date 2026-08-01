# M2 Increment 6C Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

## Scope

This subincrement connects deterministic landmark replay to a dedicated M2
laboratory. It renders replayed pose and hand landmarks through the same renderer
and quality classifier used by the live camera path, without requesting camera
access or running MediaPipe inference.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Shared live/replay landmark renderer | [`renderLandmarkFrame.ts`](../../../src/vision/renderLandmarkFrame.ts), [`useLandmarkOverlay.ts`](../../../src/labs/camera/useLandmarkOverlay.ts) | Existing camera component suite and M2 browser smoke test |
| Replay fixture catalog and tracking-loss scenario | [`replayFixtureCatalog.ts`](../../../src/vision/replay/replayFixtureCatalog.ts), [`syntheticReplayFixtures.ts`](../../../src/vision/replay/syntheticReplayFixtures.ts) | Fixture validation at catalog initialization |
| Replay laboratory route, canvas, controls, and quality display | [`LandmarkLabPage.tsx`](../../../src/labs/landmarks/LandmarkLabPage.tsx), [`LandmarkReplayCanvas.tsx`](../../../src/labs/landmarks/LandmarkReplayCanvas.tsx), [`useReplayLandmarkLab.ts`](../../../src/labs/landmarks/useReplayLandmarkLab.ts), [`landmarkLab.css`](../../../src/labs/landmarks/landmarkLab.css) | [`LandmarkLabPage.test.tsx`](../../../src/labs/landmarks/LandmarkLabPage.test.tsx), [`baseline.spec.ts`](../../../tests/e2e/baseline.spec.ts) |

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-040 | Strict TypeScript check | Passed |
| EV-M2-041 | ESLint analysis | Passed |
| EV-M2-042 | Unit and component suite | Passed: 112 tests across 23 files |
| EV-M2-043 | Production build and worker bundle | Passed |
| EV-M2-044 | M0/M1/M2 Chrome smoke suite | Passed: 3 tests; replay made no camera request |

## Manual verification checklist

- [ ] Open `/lab/landmarks`; confirm no camera permission prompt appears.
- [ ] Play `tracking-loss-recovery`; confirm pose and hand landmarks appear.
- [ ] Confirm the landmarks disappear during the middle tracking-loss interval and
      return before playback completes.
- [ ] Confirm presence, framing, quality, and hand counts change with the replay.
- [ ] Confirm pause/resume, restart, stop, and at least one alternate speed work.
- [ ] Select `empty-zone`; confirm no landmarks appear and tracking remains lost.
- [ ] Return to M1 and confirm the live camera overlay still works.

## Status

Implementation and automated checks passed. Capability M2-011 remains
`Implemented — verification pending` until the physical browser checklist above is
confirmed by the project owner.

## Known limitations

- Fixtures currently contain generated normalized landmarks rather than captured
  practitioner movement data.
- Replay verifies downstream drawing and quality behavior; it intentionally does
  not benchmark MediaPipe or the vision worker.
