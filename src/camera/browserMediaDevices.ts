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

  listDevices(): Promise<MediaDeviceInfo[]> {
    if (!this.#mediaDevices?.enumerateDevices) {
      return Promise.resolve([]);
    }

    return this.#mediaDevices.enumerateDevices();
  }

  subscribeToDeviceChanges(listener: () => void): () => void {
    if (!this.#mediaDevices?.addEventListener) {
      return () => undefined;
    }

    this.#mediaDevices.addEventListener("devicechange", listener);
    return () => {
      this.#mediaDevices?.removeEventListener("devicechange", listener);
    };
  }
}
