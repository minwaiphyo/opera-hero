import type { CameraFailure } from "./cameraTypes";

export const MAX_CAMERA_RECOVERY_ATTEMPTS = 2;

const RETRY_DELAYS_MS = [750, 2000] as const;

export type CameraRecoveryPlan = {
  attempt: number;
  delayMs: number;
};

export function planCameraRecovery(
  failure: CameraFailure,
  attemptsAlreadyMade: number,
): CameraRecoveryPlan | null {
  if (
    !failure.recoverable ||
    attemptsAlreadyMade >= MAX_CAMERA_RECOVERY_ATTEMPTS
  ) {
    return null;
  }

  return {
    attempt: attemptsAlreadyMade + 1,
    delayMs: RETRY_DELAYS_MS[attemptsAlreadyMade],
  };
}
