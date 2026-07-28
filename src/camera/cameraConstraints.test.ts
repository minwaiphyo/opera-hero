import { describe, expect, it } from "vitest";
import {
  buildCameraConstraints,
  DEFAULT_CAMERA_CONFIG,
} from "./cameraConstraints";

describe("camera constraints", () => {
  it("requests a user-facing 720p stream without microphone access", () => {
    expect(buildCameraConstraints()).toEqual({
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: { ideal: "user" },
      },
    });
  });

  it("uses an exact technician-selected device instead of facing mode", () => {
    expect(
      buildCameraConstraints({
        ...DEFAULT_CAMERA_CONFIG,
        deviceId: "usb-camera-1",
      }),
    ).toEqual({
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        deviceId: { exact: "usb-camera-1" },
      },
    });
  });

  it.each([
    ["idealWidth", 0],
    ["idealHeight", -1],
    ["idealFrameRate", Number.NaN],
  ] as const)("rejects invalid %s", (field, value) => {
    expect(() =>
      buildCameraConstraints({
        ...DEFAULT_CAMERA_CONFIG,
        [field]: value,
      }),
    ).toThrow(RangeError);
  });
});
