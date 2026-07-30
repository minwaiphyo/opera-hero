# M2 Increment 7 Verification

Date: 2026-07-31

Development branch: `m2-worker-pipeline`

## Scope

This increment reduces the amount of pixel data converted, transferred, and
preprocessed for each landmark inference. Camera frames are aspect-fitted to a
maximum 640 px edge before transfer to the worker, while the visible camera
preview retains its native resolution.

## Rationale

The pinned pose and hand tasks operate on substantially smaller internal model
inputs than the 1280×720 camera stream. Bounding only the inference bitmap should
reduce pipeline overhead without changing normalized landmark coordinates or the
preview resolution. Physical verification is required because hand stability at
the intended 1–2 metre distance is more important than a synthetic speedup.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Aspect-preserving inference-frame sizing | [`visionCapture.ts`](../../../src/vision/visionCapture.ts) | [`visionCapture.test.ts`](../../../src/vision/visionCapture.test.ts) |
| Downscaled worker-bound bitmap capture | [`useLandmarkOverlay.ts`](../../../src/labs/camera/useLandmarkOverlay.ts) | Physical camera measurement pending |
| Visible inference-input diagnostic | [`VisionDiagnosticsPanel.tsx`](../../../src/labs/camera/VisionDiagnosticsPanel.tsx) | [`VisionDiagnosticsPanel.test.tsx`](../../../src/labs/camera/VisionDiagnosticsPanel.test.tsx) |

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-050 | Strict TypeScript check | Passed |
| EV-M2-051 | ESLint analysis | Passed |
| EV-M2-052 | Unit and component suite | Passed: 117 tests across 24 files |
| EV-M2-053 | Production build and worker bundle | Passed |
| EV-M2-054 | M0/M1/M2 Chrome smoke suite | Passed: 3 tests |

## Manual comparison checklist

- [x] Confirm diagnostics reports `Aspect-fit · max 640 px`.
- [x] Run the live overlay for at least 30 seconds under conditions comparable to
      the previous measurement.
- [x] Record effective FPS, inference p50/p95, capture p50/p95, and replacement
      rate.
- [x] Confirm pose and both hands remain stable at 1 metre and 2 metres.
- [x] Cross hands and move fingers; confirm hand tracking has not materially
      regressed.
- [x] Confirm overlay alignment and preview sharpness are unchanged.

## Baseline for comparison

The project owner ran an approximately 30-second comparison on Target A.

| Metric | Previous result | 640 px result | Change |
|---|---:|---:|---:|
| Effective rate | 20.4 FPS | 18.5 FPS, generally above 20 FPS | -1.9 FPS reported average |
| Inference p50 | 43.9 ms | 53.0 ms | +9.1 ms |
| Inference p95 | 76.1 ms | 64.3 ms | -11.8 ms |
| Capture-to-result p50 | 62.9 ms | 73.3 ms | +10.4 ms |
| Capture-to-result p95 | 100.6 ms | 93.5 ms | -7.1 ms |
| Replacement rate | 44.4% | 35.4% | -9.0 percentage points |
| Replaced frames | 403 | 296 | -107 |

The p95 capture-to-result latency now passes the provisional `<100 ms` target and
the replacement rate is lower. Median latency and reported average throughput
regressed, so the cap is only provisionally accepted until tracking stability is
confirmed and a longer representative run is completed.

## Acceptance rule

Keep the 640 px cap only if capture-to-result latency or replacement pressure
improves without a material pose/hand stability regression. Otherwise adjust or
revert the cap and preserve the measured result in this report.

Current result: **passed**. The project owner confirmed stable body and two-hand
tracking at 1–2 metres, acceptable crossed-hand and finger tracking, and unchanged
overlay alignment. The 640 px cap is accepted for the current target.
