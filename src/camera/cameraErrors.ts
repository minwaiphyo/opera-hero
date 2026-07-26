import type { CameraErrorCode, CameraFailure } from "./cameraTypes";

type ErrorDefinition = Omit<CameraFailure, "diagnosticName">;

const ERROR_DEFINITIONS: Record<CameraErrorCode, ErrorDefinition> = {
  "permission-denied": {
    code: "permission-denied",
    message:
      "Camera access was blocked. Allow camera permission in the browser and try again.",
    recoverable: false,
    requiresTechnician: true,
  },
  "no-camera": {
    code: "no-camera",
    message: "No available camera was found.",
    recoverable: true,
    requiresTechnician: true,
  },
  "camera-busy": {
    code: "camera-busy",
    message:
      "The camera is unavailable. Close other applications using it and try again.",
    recoverable: true,
    requiresTechnician: false,
  },
  "unsupported-configuration": {
    code: "unsupported-configuration",
    message:
      "The camera cannot provide the requested configuration. A fallback is required.",
    recoverable: true,
    requiresTechnician: false,
  },
  "request-cancelled": {
    code: "request-cancelled",
    message: "Camera startup was interrupted before it completed.",
    recoverable: true,
    requiresTechnician: false,
  },
  "insecure-context": {
    code: "insecure-context",
    message: "Camera access requires a secure localhost or HTTPS origin.",
    recoverable: false,
    requiresTechnician: true,
  },
  "device-disconnected": {
    code: "device-disconnected",
    message: "The active camera was disconnected.",
    recoverable: true,
    requiresTechnician: false,
  },
  "service-disposed": {
    code: "service-disposed",
    message: "The camera service has already been shut down.",
    recoverable: false,
    requiresTechnician: false,
  },
  "start-failed": {
    code: "start-failed",
    message: "The camera could not be started.",
    recoverable: true,
    requiresTechnician: false,
  },
};

export class CameraServiceError extends Error {
  readonly failure: CameraFailure;

  constructor(failure: CameraFailure) {
    super(failure.message);
    this.name = "CameraServiceError";
    this.failure = failure;
  }
}

const DOM_ERROR_TO_CODE: Readonly<Record<string, CameraErrorCode>> = {
  NotAllowedError: "permission-denied",
  PermissionDeniedError: "permission-denied",
  NotFoundError: "no-camera",
  DevicesNotFoundError: "no-camera",
  NotReadableError: "camera-busy",
  TrackStartError: "camera-busy",
  OverconstrainedError: "unsupported-configuration",
  ConstraintNotSatisfiedError: "unsupported-configuration",
  AbortError: "request-cancelled",
  SecurityError: "insecure-context",
};

export function createCameraFailure(
  code: CameraErrorCode,
  diagnosticName: string = code,
): CameraFailure {
  return {
    ...ERROR_DEFINITIONS[code],
    diagnosticName,
  };
}

export function normalizeCameraError(error: unknown): CameraFailure {
  if (error instanceof CameraServiceError) {
    return error.failure;
  }

  const diagnosticName = readErrorName(error);
  const code: CameraErrorCode =
    DOM_ERROR_TO_CODE[diagnosticName] ?? "start-failed";

  return createCameraFailure(code, diagnosticName);
}

function readErrorName(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string" &&
    error.name.trim().length > 0
  ) {
    return error.name;
  }

  return "UnknownError";
}
