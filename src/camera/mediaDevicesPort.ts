export interface MediaDevicesPort {
  requestStream(constraints: MediaStreamConstraints): Promise<MediaStream>;
  listDevices(): Promise<MediaDeviceInfo[]>;
  subscribeToDeviceChanges(listener: () => void): () => void;
}
