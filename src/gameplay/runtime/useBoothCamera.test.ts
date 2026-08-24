import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CAMERA_CONFIG } from "../../camera/cameraConstraints";
import { resolveBoothCameraConfig } from "./useBoothCamera";

describe("booth camera selection", () => {
  it("opens the camera selected in the camera laboratory", async () => {
    const config = await resolveBoothCameraConfig({
      resolveSelection: vi.fn().mockResolvedValue({
        device: { deviceId: "usb-webcam", label: "External USB Camera" },
        reason: "preferred",
      }),
    });

    expect(config).toEqual({
      ...DEFAULT_CAMERA_CONFIG,
      deviceId: "usb-webcam",
    });
  });

  it("allows Chrome to choose a camera if enumeration is unavailable", async () => {
    const config = await resolveBoothCameraConfig({
      resolveSelection: vi.fn().mockRejectedValue(new Error("enumeration failed")),
    });

    expect(config).toEqual(DEFAULT_CAMERA_CONFIG);
  });
});
