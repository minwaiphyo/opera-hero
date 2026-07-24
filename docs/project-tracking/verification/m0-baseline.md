# M0 Baseline Verification

Date: 2026-07-24

Environment: provisional Target A laptop described in
[`hardware-baseline.md`](../hardware-baseline.md).

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M0-001 | TypeScript strict type check | Passed |
| EV-M0-002 | ESLint static analysis | Passed |
| EV-M0-003 | Capability collector unit tests | Passed, 2 tests |
| EV-M0-004 | Vite production build | Passed |
| EV-M0-005 | Chrome production-bundle smoke test | Passed, 1 test |
| EV-M0-006 | External-request guard during smoke test | Passed, no external requests |
| EV-M0-012 | Camera diagnostic lifecycle tests | Passed, 3 tests |

The smoke test uses the installed stable Google Chrome and serves the compiled bundle
only on `127.0.0.1`. Any non-loopback request is blocked and would fail the test.

## Read-only hardware evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M0-007 | Windows camera device enumeration | Integrated Camera by SunplusIT, status Started |
| EV-M0-008 | Display enumeration | Primary 1600 × 1000 landscape; secondary 1920 × 1080 |
| EV-M0-009 | Graphics device enumeration | Intel UHD and NVIDIA RTX 4050 Laptop GPU present |
| EV-M0-010 | Chrome executable inspection | Google Chrome 150.0.7871.182 installed |
| EV-M0-011 | Visual browser capability review | All required and optional capabilities reported available |
| EV-M0-013 | Camera preview on integrated camera | Passed |
| EV-M0-014 | Explicit camera stop and physical indicator | Passed |
| EV-M0-015 | Chrome camera permission after full restart | Passed; permission retained |
| EV-M0-016 | Local synthesized audio output | Passed |
| EV-M0-017 | Provisional display selection | Laptop panel selected; television deferred to Target B |

## Manual evidence

On 2026-07-24, the project owner confirmed that the live dashboard displayed all of
the following capabilities in green:

- Camera API
- Web Worker
- WebAssembly
- Web Audio
- IndexedDB
- WebGL 2
- WebGPU
- OffscreenCanvas

This confirms API exposure in the current browser session. It does not yet confirm
camera-stream lifecycle, retained camera permission, or audible output.

## Diagnostic controls

The M0 dashboard now includes:

- an explicit camera start control;
- a mirrored live preview;
- the selected camera label;
- explicit camera stop and automatic cleanup on unmount;
- controlled permission-denied and unavailable-camera states;
- a locally synthesized audio tone.

Automated tests verify start, stop, cleanup, and permission-denied behavior. Audible
output, physical camera-indicator behavior, and retained Chrome permission were then
confirmed through project-owner observation.

## Project-owner sign-off

On 2026-07-24, the project owner confirmed:

- integrated-camera preview passed;
- the physical camera indicator switched off after explicit stop;
- Chrome retained camera permission after a complete restart;
- the local audio tone was audible;
- the laptop display is the provisional target until the booth television is known.

Milestone M0 is complete. Television-specific validation is tracked as a future Target
B hardware profile and does not block camera laboratory work on Target A.
