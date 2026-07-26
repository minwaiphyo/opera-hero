import type { CameraConfig } from "./cameraTypes";

export const DEFAULT_CAMERA_CONFIG: Readonly<CameraConfig> = Object.freeze({
  idealWidth: 1280,
  idealHeight: 720,
  idealFrameRate: 30,
  facingMode: "user",
});

export function buildCameraConstraints(
  config: CameraConfig = DEFAULT_CAMERA_CONFIG,
): MediaStreamConstraints {
  validateCameraConfig(config);

  const video: MediaTrackConstraints = {
    width: { ideal: config.idealWidth },
    height: { ideal: config.idealHeight },
    frameRate: { ideal: config.idealFrameRate },
  };

  if (config.deviceId) {
    video.deviceId = { exact: config.deviceId };
  } else {
    video.facingMode = { ideal: config.facingMode };
  }

  return {
    audio: false,
    video,
  };
}

export function validateCameraConfig(config: CameraConfig): void {
  assertPositiveFinite(config.idealWidth, "idealWidth");
  assertPositiveFinite(config.idealHeight, "idealHeight");
  assertPositiveFinite(config.idealFrameRate, "idealFrameRate");
}

function assertPositiveFinite(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${field} must be a positive finite number.`);
  }
}
