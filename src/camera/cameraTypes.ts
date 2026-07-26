export type CameraStatus =
  | "idle"
  | "requesting-permission"
  | "starting"
  | "active"
  | "interrupted"
  | "recovering"
  | "stopped"
  | "error";

export type CameraFacingMode = "user" | "environment";

export type CameraConfig = {
  deviceId?: string;
  idealWidth: number;
  idealHeight: number;
  idealFrameRate: number;
  facingMode: CameraFacingMode;
};

export type CameraDevice = {
  deviceId: string;
  groupId?: string;
  label: string;
};

export type CameraSettings = {
  deviceId?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  facingMode?: string;
  aspectRatio?: number;
};

export type CameraSession = {
  id: string;
  startedAt: number;
  stream: MediaStream;
  settings: CameraSettings;
};

export type CameraErrorCode =
  | "permission-denied"
  | "no-camera"
  | "camera-busy"
  | "unsupported-configuration"
  | "request-cancelled"
  | "insecure-context"
  | "device-disconnected"
  | "service-disposed"
  | "start-failed";

export type CameraFailure = {
  code: CameraErrorCode;
  message: string;
  recoverable: boolean;
  requiresTechnician: boolean;
  diagnosticName: string;
};

export type CameraStopReason =
  | "requested"
  | "restart"
  | "device-ended"
  | "service-disposed"
  | "start-superseded";

export type CameraEvent =
  | { type: "status-changed"; status: CameraStatus }
  | { type: "session-started"; session: CameraSession }
  | { type: "session-stopped"; sessionId: string; reason: CameraStopReason }
  | { type: "device-list-changed"; devices: CameraDevice[] }
  | { type: "failure"; failure: CameraFailure };

export type CameraEventListener = (event: CameraEvent) => void;
export type Unsubscribe = () => void;
