import { describe, expect, it } from "vitest";
import { createCameraFailure } from "./cameraErrors";
import {
  MAX_CAMERA_RECOVERY_ATTEMPTS,
  planCameraRecovery,
} from "./cameraRecovery";

describe("planCameraRecovery", () => {
  it("plans two bounded attempts with increasing delays", () => {
    const failure = createCameraFailure("camera-busy");

    expect(planCameraRecovery(failure, 0)).toEqual({
      attempt: 1,
      delayMs: 750,
    });
    expect(planCameraRecovery(failure, 1)).toEqual({
      attempt: 2,
      delayMs: 2000,
    });
    expect(
      planCameraRecovery(failure, MAX_CAMERA_RECOVERY_ATTEMPTS),
    ).toBeNull();
  });

  it("does not retry failures requiring manual intervention", () => {
    expect(
      planCameraRecovery(createCameraFailure("permission-denied"), 0),
    ).toBeNull();
    expect(
      planCameraRecovery(createCameraFailure("insecure-context"), 0),
    ).toBeNull();
  });
});
