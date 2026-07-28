# M1 Increment 3 Verification

Date: 2026-07-26

Branch: `m1-camera-lab`

## Scope

This increment implements camera discovery, `devicechange` observation, versioned
device-local preferences, and deterministic camera-selection policy. It does not yet
render a selector or connect the service to a live preview.

## Capability-to-file map

| Capability | Implementation | Tests |
|---|---|---|
| Browser device enumeration and change observation | [`mediaDevicesPort.ts`](../../../src/camera/mediaDevicesPort.ts), [`browserMediaDevices.ts`](../../../src/camera/browserMediaDevices.ts) | [`browserMediaDevices.test.ts`](../../../src/camera/browserMediaDevices.test.ts) |
| Versioned preferred-camera storage | [`cameraPreferences.ts`](../../../src/camera/cameraPreferences.ts) | [`cameraPreferences.test.ts`](../../../src/camera/cameraPreferences.test.ts) |
| Deterministic selection and fallback | [`deviceSelection.ts`](../../../src/camera/deviceSelection.ts) | [`deviceSelection.test.ts`](../../../src/camera/deviceSelection.test.ts) |
| Camera catalog orchestration | [`cameraDeviceCatalog.ts`](../../../src/camera/cameraDeviceCatalog.ts) | [`cameraDeviceCatalog.test.ts`](../../../src/camera/cameraDeviceCatalog.test.ts) |

## Guarantees verified

- Only `videoinput` devices become camera options.
- Hidden pre-permission labels receive stable display names such as `Camera 1`.
- An available preferred device is selected.
- No camera is inferred as “external” merely from its label.
- A missing preferred device falls back to the first enumerated camera.
- A stale preferred-device value is cleared.
- Only a currently available device can become preferred.
- Invalid, obsolete, malformed, or empty stored data is rejected.
- Restricted browser storage never blocks camera operation.
- Device-change subscriptions can be removed.
- A late enumeration result is not published after unsubscribe.
- Transient enumeration failure does not terminate observation.

## Privacy boundary

Local preference storage contains only:

```json
{
  "version": 1,
  "preferredDeviceId": "<browser-provided device ID>"
}
```

It contains no frames, images, landmarks, names, or visitor information.

## Automated evidence

| Evidence ID | Check | Result |
|---|---|---|
| EV-M1-011 | Strict TypeScript check | Passed |
| EV-M1-012 | ESLint analysis | Passed |
| EV-M1-013 | Unit suite | Passed: 54 tests across 10 files |
| EV-M1-014 | Production build | Passed |
| EV-M1-015 | Existing Chrome smoke suite | Passed: 2 tests |

## Manual review boundary

The M1 page should report “Increment 3 implemented” while requesting no camera
permission. Physical enumeration and USB-camera selection will become visible when
the laboratory interface is added in Increment 4.
