# M2 Increment 6A Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

## Scope

This subincrement defines the versioned, camera-independent landmark replay format
and validates replay data before playback. It intentionally does not add a clock,
adapter, or laboratory controls yet.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Versioned replay fixture contract | [`visionReplayTypes.ts`](../../../src/vision/replay/visionReplayTypes.ts) | [`visionReplayValidation.test.ts`](../../../src/vision/replay/visionReplayValidation.test.ts) |
| Strict replay fixture parser | [`visionReplayValidation.ts`](../../../src/vision/replay/visionReplayValidation.ts) | [`visionReplayValidation.test.ts`](../../../src/vision/replay/visionReplayValidation.test.ts) |
| Deterministic empty-zone landmark fixture | [`empty-zone.json`](../../../src/vision/replay/fixtures/empty-zone.json) | Loaded and validated by the parser suite |

## Contract guarantees

- Schema version `1` is explicit and unsupported versions fail closed.
- Fixture identifiers use stable lowercase kebab-case.
- Provenance is one of `synthetic`, `practitioner-reference`, or
  `consented-participant`.
- Landmark fixtures explicitly declare that they contain no recorded imagery.
- Every frame is checked against the normalized pose/hand landmark contract.
- Frame offsets are finite, non-negative, and strictly increasing.
- A fixture contains at least one frame.
- Invalid input raises a dedicated `VisionReplayValidationError`.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-030 | Strict TypeScript check | Passed |
| EV-M2-031 | ESLint analysis | Passed |
| EV-M2-032 | Unit and component suite | Passed: 104 tests across 21 files |
| EV-M2-033 | Production build and worker bundle | Passed |
| EV-M2-034 | Existing Chrome smoke suite | Passed: 2 tests |

## Manual review

Open `empty-zone.json` and confirm it is readable landmark metadata rather than
video or image content. No live UI behavior changes in this subincrement.

## Known limitations

- Only the empty-zone fixture exists.
- No replay clock or playback state exists.
- The live worker is not yet wrapped by the shared adapter boundary.
- Replay frames cannot yet be drawn in the laboratory.

## Next subincrement

Add the common adapter contract plus a deterministic replay clock with
play/pause/restart/speed behavior and fake-clock tests.
