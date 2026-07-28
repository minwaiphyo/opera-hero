import { BrowserMediaDevices } from "../../camera/browserMediaDevices";
import { CameraDeviceCatalog } from "../../camera/cameraDeviceCatalog";
import { CameraPreferenceStore } from "../../camera/cameraPreferences";
import { CameraService } from "../../camera/cameraService";
import type {
  CameraConfig,
  CameraDevice,
  CameraEventListener,
  CameraSession,
  CameraStatus,
  CameraStopReason,
  Unsubscribe,
} from "../../camera/cameraTypes";

export interface CameraServiceController {
  getStatus(): CameraStatus;
  getSession(): CameraSession | null;
  subscribe(listener: CameraEventListener): Unsubscribe;
  start(config?: CameraConfig): Promise<CameraSession>;
  stop(reason?: CameraStopReason): void;
  restart(config?: CameraConfig): Promise<CameraSession>;
  dispose(): void;
}

export interface CameraCatalogController {
  listCameras(): Promise<CameraDevice[]>;
  resolveSelection(): Promise<{
    device: CameraDevice | null;
  }>;
  setPreferredDevice(deviceId: string): Promise<CameraDevice | null>;
  subscribe(listener: (devices: CameraDevice[]) => void): Unsubscribe;
}

export type CameraLabRuntime = {
  service: CameraServiceController;
  catalog: CameraCatalogController;
};

export type CameraLabRuntimeFactory = () => CameraLabRuntime;

export const createBrowserCameraLabRuntime: CameraLabRuntimeFactory = () => {
  const mediaDevices = new BrowserMediaDevices();
  const preferences = new CameraPreferenceStore();

  return {
    service: new CameraService(mediaDevices),
    catalog: new CameraDeviceCatalog(mediaDevices, preferences),
  };
};
