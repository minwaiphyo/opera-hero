export interface MediaDevicesPort {
  requestStream(constraints: MediaStreamConstraints): Promise<MediaStream>;
}
