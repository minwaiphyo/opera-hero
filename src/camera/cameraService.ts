import { buildCameraConstraints, DEFAULT_CAMERA_CONFIG } from "./cameraConstraints";
import {
  CameraServiceError,
  createCameraFailure,
  normalizeCameraError,
} from "./cameraErrors";
import type {
  CameraConfig,
  CameraEvent,
  CameraEventListener,
  CameraSession,
  CameraSettings,
  CameraStatus,
  CameraStopReason,
  Unsubscribe,
} from "./cameraTypes";
import type { MediaDevicesPort } from "./mediaDevicesPort";

type CameraServiceDependencies = {
  createSessionId?: () => string;
  now?: () => number;
};

export class CameraService {
  readonly #mediaDevices: MediaDevicesPort;
  readonly #createSessionId: () => string;
  readonly #now: () => number;
  readonly #listeners = new Set<CameraEventListener>();

  #status: CameraStatus = "idle";
  #session: CameraSession | null = null;
  #pendingStart: Promise<CameraSession> | null = null;
  #requestGeneration = 0;
  #disposed = false;
  #endedListeners = new Map<MediaStreamTrack, EventListener>();

  constructor(
    mediaDevices: MediaDevicesPort,
    dependencies: CameraServiceDependencies = {},
  ) {
    this.#mediaDevices = mediaDevices;
    this.#createSessionId =
      dependencies.createSessionId ?? (() => crypto.randomUUID());
    this.#now = dependencies.now ?? (() => performance.now());
  }

  getStatus(): CameraStatus {
    return this.#status;
  }

  getSession(): CameraSession | null {
    return this.#session;
  }

  subscribe(listener: CameraEventListener): Unsubscribe {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  start(
    config: CameraConfig = DEFAULT_CAMERA_CONFIG,
  ): Promise<CameraSession> {
    if (this.#disposed) {
      return Promise.reject(
        new CameraServiceError(createCameraFailure("service-disposed")),
      );
    }

    if (this.#session) {
      return Promise.resolve(this.#session);
    }

    if (this.#pendingStart) {
      return this.#pendingStart;
    }

    const generation = ++this.#requestGeneration;
    const constraints = buildCameraConstraints(config);
    this.#setStatus("requesting-permission");

    const pending = this.#openSession(constraints, generation);
    this.#pendingStart = pending;

    void pending.then(
      () => this.#clearPendingStart(pending),
      () => this.#clearPendingStart(pending),
    );

    return pending;
  }

  stop(reason: CameraStopReason = "requested"): void {
    ++this.#requestGeneration;
    this.#pendingStart = null;

    const session = this.#session;
    this.#session = null;

    if (session) {
      this.#detachEndedListeners();
      stopAllTracks(session.stream);
      this.#emit({
        type: "session-stopped",
        sessionId: session.id,
        reason,
      });
    }

    this.#setStatus("stopped");
  }

  async restart(
    config: CameraConfig = DEFAULT_CAMERA_CONFIG,
  ): Promise<CameraSession> {
    this.stop("restart");
    return this.start(config);
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }

    this.#disposed = true;
    this.stop("service-disposed");
    this.#listeners.clear();
  }

  async #openSession(
    constraints: MediaStreamConstraints,
    generation: number,
  ): Promise<CameraSession> {
    try {
      const stream = await this.#mediaDevices.requestStream(constraints);

      if (this.#disposed || generation !== this.#requestGeneration) {
        stopAllTracks(stream);
        throw new CameraServiceError(
          createCameraFailure("request-cancelled"),
        );
      }

      this.#setStatus("starting");
      const session: CameraSession = {
        id: this.#createSessionId(),
        startedAt: this.#now(),
        stream,
        settings: readCameraSettings(stream),
      };

      this.#session = session;
      this.#attachEndedListeners(session);
      this.#setStatus("active");
      this.#emit({ type: "session-started", session });

      return session;
    } catch (error) {
      const failure = normalizeCameraError(error);

      if (failure.code !== "request-cancelled") {
        this.#setStatus("error");
        this.#emit({ type: "failure", failure });
      }

      throw new CameraServiceError(failure);
    }
  }

  #attachEndedListeners(session: CameraSession): void {
    for (const track of session.stream.getTracks()) {
      const listener: EventListener = () => {
        if (this.#session?.id !== session.id) {
          return;
        }

        ++this.#requestGeneration;
        this.#session = null;
        this.#detachEndedListeners();
        stopAllTracks(session.stream);
        this.#setStatus("interrupted");
        this.#emit({
          type: "failure",
          failure: createCameraFailure("device-disconnected"),
        });
        this.#emit({
          type: "session-stopped",
          sessionId: session.id,
          reason: "device-ended",
        });
      };

      track.addEventListener("ended", listener);
      this.#endedListeners.set(track, listener);
    }
  }

  #detachEndedListeners(): void {
    for (const [track, listener] of this.#endedListeners) {
      track.removeEventListener("ended", listener);
    }
    this.#endedListeners.clear();
  }

  #setStatus(status: CameraStatus): void {
    if (this.#status === status) {
      return;
    }

    this.#status = status;
    this.#emit({ type: "status-changed", status });
  }

  #clearPendingStart(pending: Promise<CameraSession>): void {
    if (this.#pendingStart === pending) {
      this.#pendingStart = null;
    }
  }

  #emit(event: CameraEvent): void {
    for (const listener of this.#listeners) {
      try {
        listener(event);
      } catch {
        // Subscribers are observational. One faulty subscriber must not break
        // camera ownership or prevent other subscribers from receiving events.
      }
    }
  }
}

function stopAllTracks(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

function readCameraSettings(stream: MediaStream): CameraSettings {
  const track = stream.getVideoTracks()[0];
  if (!track) {
    return {};
  }

  const settings = track.getSettings();
  return {
    deviceId: settings.deviceId,
    width: settings.width,
    height: settings.height,
    frameRate: settings.frameRate,
    facingMode: settings.facingMode,
    aspectRatio: settings.aspectRatio,
  };
}
