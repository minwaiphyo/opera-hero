import type { CameraDevice } from "./cameraTypes";

export type CameraSelection =
  | {
      device: CameraDevice;
      reason: "preferred" | "fallback";
      stalePreferredDeviceId?: string;
    }
  | {
      device: null;
      reason: "none";
      stalePreferredDeviceId?: string;
    };

export function selectCamera(
  devices: readonly CameraDevice[],
  preferredDeviceId?: string,
): CameraSelection {
  if (preferredDeviceId) {
    const preferred = devices.find(
      (device) => device.deviceId === preferredDeviceId,
    );

    if (preferred) {
      return { device: preferred, reason: "preferred" };
    }
  }

  const fallback = devices[0];
  if (fallback) {
    return {
      device: fallback,
      reason: "fallback",
      ...(preferredDeviceId
        ? { stalePreferredDeviceId: preferredDeviceId }
        : {}),
    };
  }

  return {
    device: null,
    reason: "none",
    ...(preferredDeviceId
      ? { stalePreferredDeviceId: preferredDeviceId }
      : {}),
  };
}
