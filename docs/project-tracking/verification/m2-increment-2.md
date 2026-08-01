# M2 Increment 2 Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

## Scope

This increment defines the browser worker boundary for vision inference and adds a
bounded latest-frame scheduler. It deliberately does not connect the live overlay
to a worker yet. This lets message validation, transferable ownership, and
backpressure behavior be reviewed and reverted independently from the existing
working MediaPipe integration.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Typed worker command/response protocol and runtime response validation | [`visionWorkerProtocol.ts`](../../../src/vision/visionWorkerProtocol.ts) | [`visionWorkerProtocol.test.ts`](../../../src/vision/visionWorkerProtocol.test.ts) |
| One-in-flight, one-pending latest-frame scheduler | [`latestFrameScheduler.ts`](../../../src/vision/latestFrameScheduler.ts) | [`latestFrameScheduler.test.ts`](../../../src/vision/latestFrameScheduler.test.ts) |

## Contract guarantees

- Worker initialization receives serializable asset paths, model selection,
  hand-count limit, and preferred delegate.
- Frame commands transfer an `ImageBitmap` together with a stable frame identifier
  and capture timestamp.
- Worker responses are checked at runtime before entering application code.
- Only one frame may be in flight and at most one newer frame may wait.
- When a newer waiting frame arrives, the superseded bitmap is explicitly closed.
- A stale completion cannot release the active frame.
- Disposal closes any waiting bitmap, and subsequent submissions are closed and
  rejected.
- The scheduler records submitted, sent, replaced, and rejected counts for later
  diagnostics.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-007 | Strict TypeScript check | Passed |
| EV-M2-008 | ESLint analysis | Passed |
| EV-M2-009 | Unit and component suite | Passed: 80 tests across 16 files |
| EV-M2-010 | Production build with local WASM copy | Passed |
| EV-M2-011 | Existing Chrome smoke suite | Passed: 2 tests |

## Manual review

Because this increment is intentionally disconnected from the live path, there is
no new visual behavior. Confirm that the existing camera preview and pose/hand
overlay still start, track, stop, and restart as before.

## Known limitations

- The MediaPipe detector instances and live inference loop still run on the main
  thread.
- The worker implementation and lifecycle controller do not exist yet.
- The scheduler counters are not yet displayed in the laboratory.
- An in-flight bitmap is owned by the future worker after transfer and therefore
  cannot be reclaimed by the main-thread scheduler during disposal.

## Next increment

Create the worker implementation, move detector ownership and inference into it,
and connect the existing camera overlay through this tested protocol and scheduler.
