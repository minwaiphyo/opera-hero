# M2 Increment 5 Verification

Date: 2026-07-30

Development branch: `m2-worker-pipeline`

## Scope

This increment converts normalized pose and hand output into model-independent
visitor-presence, framing, and tracking-quality signals. The live worker diagnostics
panel exposes those signals for Target A calibration before they are used by the
unmanned presence trigger or gesture scoring.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Presence, framing, and quality classification | [`visionQuality.ts`](../../../src/vision/visionQuality.ts) | [`visionQuality.test.ts`](../../../src/vision/visionQuality.test.ts) |
| Quality integration into bounded diagnostics | [`visionDiagnostics.ts`](../../../src/vision/visionDiagnostics.ts) | [`visionDiagnostics.test.ts`](../../../src/vision/visionDiagnostics.test.ts) |
| Live quality display | [`VisionDiagnosticsPanel.tsx`](../../../src/labs/camera/VisionDiagnosticsPanel.tsx) | [`VisionDiagnosticsPanel.test.tsx`](../../../src/labs/camera/VisionDiagnosticsPanel.test.tsx) |

## Classification rules

- Presence requires average visibility of the nose, both shoulders, and both hips
  to be at least `0.5`.
- Framing uses normalized nose-to-hip-centre distance:
  - below `0.25`: `too-far`;
  - above `0.72`: `too-close`;
  - otherwise: `good`.
- Tracking quality combines:
  - 60% essential upper-body landmark visibility;
  - 20% upper-body landmarks inside a 4% safe frame margin;
  - 20% detected-hand completeness, up to two hands.
- Quality bands are:
  - below `0.35`: `poor`;
  - below `0.80`: `fair`;
  - otherwise: `good`;
  - no reliable presence: `lost`.

These thresholds are provisional Target A calibration values. They are not gesture
scores and do not encode Cantonese Opera technique.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M2-024 | Strict TypeScript check | Passed |
| EV-M2-025 | ESLint analysis | Passed |
| EV-M2-026 | Unit and component suite | Passed: 98 tests across 20 files |
| EV-M2-027 | Production build and worker bundle | Passed |
| EV-M2-028 | Existing Chrome smoke suite | Passed: 2 tests |
| EV-M2-029 | Target A presence, framing, and quality review | Passed: all expected qualitative states confirmed |

## Manual physical-camera checklist

Completed by the project owner on Target A:

1. Leave the camera zone empty and confirm `absent`, `lost`, and zero detected
   hands.
2. Stand at approximately 1–2 m with head, shoulders, hips, arms, and hands visible.
   Confirm `present`, preferably `good` framing, and two detected hands.
3. Move farther away until framing reports `too far`.
4. Move close to the camera until framing reports `too close`.
5. Return to the intended zone and confirm framing returns to `good`.
6. Hide one hand, then both hands, and confirm the hand count and quality decrease.
7. Move wrists or one side of the upper body outside the frame and confirm coverage
   and quality decrease.
8. Turn sideways and cross hands; confirm presence does not flicker excessively.
9. Record any distance state that does not match the physical position.

Record the displayed upper-body scale at the intended near and far edges of the
visitor zone so threshold changes can be evidence-based.

The project owner confirmed that every expected qualitative result passed:

- empty-zone absence and lost tracking;
- present/good classification in the intended zone;
- too-far and too-close transitions;
- reduced hand count and quality when one or both hands were hidden;
- reduced coverage and quality when partially outside the frame.

Exact upper-body scale values were not recorded in this review. Capture them if
threshold calibration is revisited for a different camera or exhibition laptop.

## Known limitations

- Thresholds passed qualitative Target A calibration; exact boundary scale values
  remain unrecorded.
- Quality is an instantaneous frame signal; temporal smoothing and presence dwell
  belong to the consumer layer.
- Hand Landmarker does not expose per-point visibility, so hand contribution uses
  detected-hand completeness rather than hand-landmark visibility.
- This classification does not judge gesture correctness.
- Pose Full comparison, replay adapter, one-hour latency/quality validation, varied
  sleeves/lighting/background checks, and the open latency issue remain.

## Next increment

Calibrate or revise the quality thresholds from physical results, then add the
repeatable validation/replay path and Pose Lite-versus-Full comparison needed to
close M2.
