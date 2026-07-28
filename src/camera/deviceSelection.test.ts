import { describe, expect, it } from "vitest";
import type { CameraDevice } from "./cameraTypes";
import { selectCamera } from "./deviceSelection";

const devices: CameraDevice[] = [
  { deviceId: "integrated", label: "Integrated Camera" },
  { deviceId: "external", label: "External Camera" },
];

describe("camera selection policy", () => {
  it("selects an available preferred device", () => {
    expect(selectCamera(devices, "external")).toEqual({
      device: devices[1],
      reason: "preferred",
    });
  });

  it("falls back deterministically when the preferred device is missing", () => {
    expect(selectCamera(devices, "removed")).toEqual({
      device: devices[0],
      reason: "fallback",
      stalePreferredDeviceId: "removed",
    });
  });

  it("uses the first available camera when no preference exists", () => {
    expect(selectCamera(devices)).toEqual({
      device: devices[0],
      reason: "fallback",
    });
  });

  it("reports no selection and a stale preference when no camera exists", () => {
    expect(selectCamera([], "removed")).toEqual({
      device: null,
      reason: "none",
      stalePreferredDeviceId: "removed",
    });
  });
});
