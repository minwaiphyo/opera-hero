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
| Activation | Visitor presses the on-screen Start button |

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

## M1 camera validation on Target A

Manual camera-laboratory review on 2026-07-28 confirmed:

- the integrated camera can show the visitor's head, shoulders, arms, and hands within
  the positioning guide at approximately 1–2 metres;
- delivered resolution, frame rate, and aspect ratio are reported by the live camera
  track;
- stopping, restarting, navigating away, blocking permission, restoring permission,
  and manual recovery all produce controlled states;
- the physical standing zone remains provisional until the final camera mount and
  exhibition USB camera are available.

The one-hour Target A stability result is recorded separately in
[`verification/m1-increment-6.md`](./verification/m1-increment-6.md).

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

## Session activation decision

The visitor begins a session by pressing the on-screen Start button (DEC-009, which
supersedes DEC-004). Sustained presence was the earlier plan, but standing in front of
the booth is not the same as wanting a turn: people walk past, queue, and watch a friend
perform, and all of them sustain presence. The booth stays unmanned either way — every
screen after Start advances on its own, and an abandoned session returns to attract
without anybody attending to it.

Camera presence still drives everything inside a session somebody chose to start:

1. tracking guidance while the visitor positions themselves;
2. recovery when the frame empties mid-session;
3. return to attract after a bounded no-presence period.

A session cannot begin while the camera is unavailable, and attract asks for staff if
the camera stays down.

## Assumptions requiring later validation

- The final USB camera field of view can include head, shoulders, arms, and hands at
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
