import type { MediaDevicesPort } from "./mediaDevicesPort";

export class BrowserMediaDevices implements MediaDevicesPort {
  readonly #mediaDevices: MediaDevices | undefined;
  readonly #secureContext: boolean;

  constructor(
    mediaDevices: MediaDevices | undefined = navigator.mediaDevices,
    secureContext: boolean = window.isSecureContext,
  ) {
    this.#mediaDevices = mediaDevices;
    this.#secureContext = secureContext;
  }

  requestStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
    if (!this.#secureContext) {
      return Promise.reject(
        new DOMException(
          "Camera access requires a secure context.",
          "SecurityError",
        ),
      );
    }

    if (!this.#mediaDevices?.getUserMedia) {
      return Promise.reject(
        new DOMException("No browser camera API is available.", "NotFoundError"),
      );
    }

    return this.#mediaDevices.getUserMedia(constraints);
  }
}
