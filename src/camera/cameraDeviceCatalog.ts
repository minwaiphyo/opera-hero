import type { CameraPreferenceStore } from "./cameraPreferences";
import type { CameraDevice } from "./cameraTypes";
import type { CameraSelection } from "./deviceSelection";
import { selectCamera } from "./deviceSelection";
import type { MediaDevicesPort } from "./mediaDevicesPort";

export type CameraDeviceListener = (devices: CameraDevice[]) => void;

export class CameraDeviceCatalog {
  readonly #mediaDevices: MediaDevicesPort;
  readonly #preferences: CameraPreferenceStore;

  constructor(
    mediaDevices: MediaDevicesPort,
    preferences: CameraPreferenceStore,
  ) {
    this.#mediaDevices = mediaDevices;
    this.#preferences = preferences;
  }

  async listCameras(): Promise<CameraDevice[]> {
    const devices = await this.#mediaDevices.listDevices();
    let cameraNumber = 0;

    return devices
      .filter((device) => device.kind === "videoinput")
      .map((device) => {
        cameraNumber += 1;
        const label = device.label.trim() || `Camera ${cameraNumber}`;

        return {
          deviceId: device.deviceId,
          label,
          ...(device.groupId ? { groupId: device.groupId } : {}),
        };
      });
  }

  async resolveSelection(): Promise<CameraSelection> {
    const devices = await this.listCameras();
    const preferredDeviceId = this.#preferences.load().preferredDeviceId;
    const selection = selectCamera(devices, preferredDeviceId);

    if (selection.stalePreferredDeviceId) {
      this.#preferences.clear();
    }

    return selection;
  }

  async setPreferredDevice(deviceId: string): Promise<CameraDevice | null> {
    const devices = await this.listCameras();
    const selected = devices.find((device) => device.deviceId === deviceId);

    if (!selected) {
      return null;
    }

    this.#preferences.savePreferredDevice(selected.deviceId);
    return selected;
  }

  clearPreferredDevice(): void {
    this.#preferences.clear();
  }

  subscribe(listener: CameraDeviceListener): () => void {
    let active = true;
    const unsubscribe = this.#mediaDevices.subscribeToDeviceChanges(() => {
      void this.listCameras().then(
        (devices) => {
          if (active) {
            listener(devices);
          }
        },
        () => {
          // A transient enumeration failure must not break device observation.
        },
      );
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }
}
