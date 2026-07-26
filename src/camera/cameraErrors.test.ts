import { describe, expect, it } from "vitest";
import { createCameraFailure, normalizeCameraError } from "./cameraErrors";

describe("camera error normalization", () => {
  it.each([
    ["NotAllowedError", "permission-denied"],
    ["NotFoundError", "no-camera"],
    ["NotReadableError", "camera-busy"],
    ["OverconstrainedError", "unsupported-configuration"],
    ["AbortError", "request-cancelled"],
    ["SecurityError", "insecure-context"],
  ] as const)("maps %s to %s", (name, code) => {
    expect(normalizeCameraError(new DOMException("test", name))).toMatchObject({
      code,
      diagnosticName: name,
    });
  });

  it("uses a safe fallback without exposing an unknown exception message", () => {
    const failure = normalizeCameraError(new Error("private diagnostic detail"));

    expect(failure).toEqual({
      code: "start-failed",
      message: "The camera could not be started.",
      recoverable: true,
      requiresTechnician: false,
      diagnosticName: "Error",
    });
    expect(failure.message).not.toContain("private diagnostic detail");
  });

  it("creates a typed disconnection failure for non-DOM events", () => {
    expect(createCameraFailure("device-disconnected")).toEqual({
      code: "device-disconnected",
      message: "The active camera was disconnected.",
      recoverable: true,
      requiresTechnician: false,
      diagnosticName: "device-disconnected",
    });
  });
});
