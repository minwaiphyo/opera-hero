# Provisional Hardware Baseline

Captured on 2026-07-24 for Milestone M0.

## Target A — development laptop

| Item | Baseline |
|---|---|
| Manufacturer and model | Lenovo Legion Slim 7 16IRH8 (82Y3) |
| Operating system | Microsoft Windows 11 Home, x64; build 26200 |
| Processor | 13th Gen Intel Core i7-13700H; 14 cores / 20 logical processors |
| Memory | 16 GB installed |
| Integrated graphics | Intel UHD Graphics |
| Discrete graphics | NVIDIA GeForce RTX 4050 Laptop GPU |
| Camera | SunplusIT Integrated Camera; active Windows camera device |
| Primary display | 3200 × 2000 physical panel; Windows currently exposes a 1600 × 1000 logical viewport; landscape |
| Secondary display observed | 1920 × 1080; landscape |
| Provisional exhibition browser | Google Chrome 150.0.7871.182 |
| Node used for development | 24.13.1 |
| Visitor interaction zone | Approximately 1–2 metres from the integrated camera |
| Activation | Sustained camera presence |

The laptop appears to use 200% Windows display scaling: its 3200 × 2000 physical panel
is exposed to browser layout as approximately 1600 × 1000 CSS pixels. This is expected
and both measurements are relevant. Layout responds to CSS pixels; rendering sharpness
and GPU workload are affected by the physical pixel density and device pixel ratio.

The secondary display was connected when this baseline was captured. The application
must remain responsive to the current viewport and must not assume that the primary
display is always the exhibition display.

The eventual booth display will probably be a television, but its model, physical
dimensions, native resolution, refresh rate, overscan behavior, and viewing distance
are not yet confirmed. Target A remains the laptop display until Target B is available.

## Browser decision

Use stable Google Chrome as the provisional development and kiosk browser.

Reasons:

- it exposes the browser APIs needed by the planned MediaPipe/Web Worker pipeline;
- it is already installed on the target laptop;
- it provides a predictable kiosk command-line mode on Windows;
- using one pinned Chromium build reduces compatibility variation during testing.

Microsoft Edge is a technically credible fallback because it uses Chromium and offers
strong Windows kiosk management. Changing to Edge would not materially change the web
application. Chrome remains the baseline for now to keep development and exhibition
testing on one browser.

The exact exhibition browser version must be frozen and retested before release.
Automatic updates should not occur during exhibition hours.

## Camera-presence activation decision

Presence activation is provisional and will be implemented after landmark tracking is
available. It must not start from a single noisy frame.

Planned policy:

1. Detect one sufficiently visible upper body inside the framing zone.
2. Require stable presence for a configurable dwell period.
3. Enter the welcome state, not immediate gameplay.
4. Apply a cooldown after reset so departing visitors do not retrigger the session.
5. Return to attract mode after a bounded no-presence period.

Thresholds will be tuned in M2–M5. Until pose inference exists, M1 will provide manual
camera start/stop and framing diagnostics only.

## Assumptions requiring later validation

- The integrated camera field of view can include head, shoulders, arms, and hands at
  1–2 metres.
- The laptop can be mounted at a suitable height and angle.
- Exhibition lighting provides adequate front illumination.
- Chrome camera permission can be persisted for the localhost application origin.
- The integrated camera remains available and thermally stable during a full day.
- The primary or selected external display can be locked to landscape orientation.
- A future television accepts a standard landscape output without overscan or forced
  image processing that adds noticeable latency.

None of these assumptions is considered verified until its associated M1, M2, M9, or
M10 hardware test passes.

## Future television adaptation

Changing to a television should require configuration and validation, not a rewrite.
The application uses responsive layout, relative sizing, and the browser viewport
instead of fixed physical pixels.

When the television is known, create a Target B profile and verify:

- 16:9 versus another aspect ratio;
- native resolution and Windows scaling;
- refresh rate and display/game mode;
- overscan and safe-area clipping;
- readability at the real visitor distance;
- camera placement relative to the larger display;
- animation and inference performance at the selected rendering resolution.

The display should normally run at its native resolution, with TV overscan disabled
and Game or PC mode enabled when available.
