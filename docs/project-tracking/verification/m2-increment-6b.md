# M2 Increment 6B Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

## Scope

This subincrement adds the common normalized-frame source boundary and a
deterministic replay implementation. Playback scheduling is independently tested
with a fake clock and is not yet connected to laboratory controls.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Common live/replay adapter contract | [`visionAdapter.ts`](../../../src/vision/visionAdapter.ts) | TypeScript contract check |
| Injectable replay clock boundary | [`replayClock.ts`](../../../src/vision/replay/replayClock.ts) | [`replayVisionAdapter.test.ts`](../../../src/vision/replay/replayVisionAdapter.test.ts) |
| Deterministic replay playback adapter | [`replayVisionAdapter.ts`](../../../src/vision/replay/replayVisionAdapter.ts) | [`replayVisionAdapter.test.ts`](../../../src/vision/replay/replayVisionAdapter.test.ts) |

## Adapter guarantees

- Consumers subscribe to normalized frames and lifecycle state without depending
  on a camera, worker, MediaPipe, or fixture implementation.
- Fixture validation occurs when the replay adapter is constructed.
- Frames preserve their stored order and exact normalized landmark values.
- Stored offsets determine emission time; playback speed changes only scheduling.
- Pause records the logical replay position and resume continues from it.
- Restart returns to frame zero and resets the emitted-frame count.
- Stop resets playback to idle and cancels pending timers.
- Playback speed is bounded from `0.25x` to `4x`.
- Disposal cancels scheduling, clears listeners, and rejects later starts.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-035 | Strict TypeScript check | Passed |
| EV-M2-036 | ESLint analysis | Passed |
| EV-M2-037 | Unit and component suite | Passed: 109 tests across 22 files |
| EV-M2-038 | Production build and worker bundle | Passed |
| EV-M2-039 | Existing Chrome smoke suite | Passed: 2 tests |

## Manual review

No live UI behavior changes in this subincrement. Review the replay adapter tests to
confirm the intended play, pause, speed, restart, stop, and dispose semantics.

## Known limitations

- The current live camera pipeline has not yet been wrapped by the common adapter.
- Only the empty-zone JSON fixture exists.
- Replay output is not yet rendered in the camera/landmark laboratory.
- Laboratory playback controls do not exist.

## Next subincrement

Integrate replay mode into the laboratory, add visible playback controls, render
replay frames through the same drawing and quality pipeline, and add representative
synthetic tracking fixtures.
