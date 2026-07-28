import { describe, expect, it, vi } from "vitest";
import { CameraServiceError } from "./cameraErrors";
import { CameraService } from "./cameraService";
import type { CameraEvent } from "./cameraTypes";
import type { MediaDevicesPort } from "./mediaDevicesPort";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

class FakeTrack extends EventTarget {
  readonly stop = vi.fn();
  readonly getSettings = vi.fn(() => ({
    deviceId: "camera-a",
    width: 1280,
    height: 720,
    frameRate: 30,
    facingMode: "user",
    aspectRatio: 16 / 9,
  }));

  end(): void {
    this.dispatchEvent(new Event("ended"));
  }
}

function createFakeStream(trackCount = 1) {
  const tracks = Array.from({ length: trackCount }, () => new FakeTrack());
  const stream = {
    getTracks: () => tracks,
    getVideoTracks: () => tracks,
  } as unknown as MediaStream;

  return { stream, tracks };
}

function createPort(
  requestStream: MediaDevicesPort["requestStream"],
): MediaDevicesPort {
  return {
    requestStream,
    listDevices: vi.fn().mockResolvedValue([]),
    subscribeToDeviceChanges: vi.fn(() => () => undefined),
  };
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createService(
  requestStream: MediaDevicesPort["requestStream"],
): CameraService {
  return new CameraService(createPort(requestStream), {
    createSessionId: () => "session-1",
    now: () => 1234,
  });
}

describe("CameraService", () => {
  it("starts one session and publishes actual track settings", async () => {
    const { stream } = createFakeStream();
    const requestStream = vi.fn().mockResolvedValue(stream);
    const service = createService(requestStream);
    const events: CameraEvent[] = [];
    service.subscribe((event) => events.push(event));

    const session = await service.start();

    expect(session).toMatchObject({
      id: "session-1",
      startedAt: 1234,
      settings: {
        deviceId: "camera-a",
        width: 1280,
        height: 720,
        frameRate: 30,
        facingMode: "user",
        aspectRatio: 16 / 9,
      },
    });
    expect(service.getStatus()).toBe("active");
    expect(service.getSession()).toBe(session);
    expect(events.map((event) => event.type)).toEqual([
      "status-changed",
      "status-changed",
      "status-changed",
      "session-started",
    ]);
  });

  it("coalesces simultaneous and active start calls", async () => {
    const pending = deferred<MediaStream>();
    const requestStream = vi.fn(() => pending.promise);
    const service = createService(requestStream);
    const first = service.start();
    const second = service.start();
    const { stream } = createFakeStream();

    expect(requestStream).toHaveBeenCalledOnce();
    pending.resolve(stream);

    const [firstSession, secondSession] = await Promise.all([first, second]);
    const thirdSession = await service.start();
    expect(firstSession).toBe(secondSession);
    expect(thirdSession).toBe(firstSession);
    expect(requestStream).toHaveBeenCalledOnce();
  });

  it("stops every track and makes repeated stops safe", async () => {
    const { stream, tracks } = createFakeStream(2);
    const service = createService(vi.fn().mockResolvedValue(stream));

    await service.start();
    service.stop();
    service.stop();

    expect(tracks[0].stop).toHaveBeenCalledOnce();
    expect(tracks[1].stop).toHaveBeenCalledOnce();
    expect(service.getSession()).toBeNull();
    expect(service.getStatus()).toBe("stopped");
  });

  it("closes every track across 50 start and stop cycles", async () => {
    const openedTracks: FakeTrack[] = [];
    const requestStream = vi.fn(async () => {
      const { stream, tracks } = createFakeStream(2);
      openedTracks.push(...tracks);
      return stream;
    });
    const service = createService(requestStream);

    for (let cycle = 0; cycle < 50; cycle += 1) {
      await service.start();
      service.stop();
    }

    expect(requestStream).toHaveBeenCalledTimes(50);
    expect(openedTracks).toHaveLength(100);
    for (const track of openedTracks) {
      expect(track.stop).toHaveBeenCalledOnce();
    }
    expect(service.getSession()).toBeNull();
    expect(service.getStatus()).toBe("stopped");
  });

  it("restarts by stopping the old session before requesting a new one", async () => {
    const first = createFakeStream();
    const second = createFakeStream();
    const requestStream = vi
      .fn()
      .mockResolvedValueOnce(first.stream)
      .mockResolvedValueOnce(second.stream);
    const service = createService(requestStream);

    await service.start();
    const restarted = await service.restart();

    expect(first.tracks[0].stop).toHaveBeenCalledOnce();
    expect(restarted.stream).toBe(second.stream);
    expect(requestStream).toHaveBeenCalledTimes(2);
  });

  it("starts a fresh request when restart supersedes a pending start", async () => {
    const firstPending = deferred<MediaStream>();
    const secondPending = deferred<MediaStream>();
    const requestStream = vi
      .fn()
      .mockImplementationOnce(() => firstPending.promise)
      .mockImplementationOnce(() => secondPending.promise);
    const service = createService(requestStream);
    const firstStart = service.start();
    const restart = service.restart();
    const first = createFakeStream();
    const second = createFakeStream();

    firstPending.resolve(first.stream);
    secondPending.resolve(second.stream);

    await expect(firstStart).rejects.toMatchObject({
      failure: { code: "request-cancelled" },
    });
    await expect(restart).resolves.toMatchObject({ stream: second.stream });
    expect(first.tracks[0].stop).toHaveBeenCalledOnce();
    expect(second.tracks[0].stop).not.toHaveBeenCalled();
    expect(requestStream).toHaveBeenCalledTimes(2);
    expect(service.getSession()?.stream).toBe(second.stream);
  });

  it("invalidates and stops a stream that resolves after stop", async () => {
    const pending = deferred<MediaStream>();
    const service = createService(vi.fn(() => pending.promise));
    const start = service.start();
    const { stream, tracks } = createFakeStream();

    service.stop();
    pending.resolve(stream);

    await expect(start).rejects.toMatchObject({
      failure: { code: "request-cancelled" },
    });
    expect(tracks[0].stop).toHaveBeenCalledOnce();
    expect(service.getSession()).toBeNull();
    expect(service.getStatus()).toBe("stopped");
  });

  it("normalizes browser errors and publishes a safe failure", async () => {
    const service = createService(
      vi
        .fn()
        .mockRejectedValue(new DOMException("browser details", "NotAllowedError")),
    );
    const events: CameraEvent[] = [];
    service.subscribe((event) => events.push(event));

    await expect(service.start()).rejects.toMatchObject({
      failure: {
        code: "permission-denied",
        message:
          "Camera access was blocked. Allow camera permission in the browser and try again.",
      },
    });
    expect(service.getStatus()).toBe("error");
    expect(events.at(-1)).toMatchObject({
      type: "failure",
      failure: { code: "permission-denied" },
    });
  });

  it("moves to interrupted when the active track ends", async () => {
    const { stream, tracks } = createFakeStream();
    const service = createService(vi.fn().mockResolvedValue(stream));
    const events: CameraEvent[] = [];
    service.subscribe((event) => events.push(event));

    await service.start();
    tracks[0].end();

    expect(service.getStatus()).toBe("interrupted");
    expect(service.getSession()).toBeNull();
    expect(events).toContainEqual({
      type: "failure",
      failure: expect.objectContaining({ code: "device-disconnected" }),
    });
    expect(events).toContainEqual({
      type: "session-stopped",
      sessionId: "session-1",
      reason: "device-ended",
    });
  });

  it("unsubscribes observers and isolates observer failures", async () => {
    const { stream } = createFakeStream();
    const service = createService(vi.fn().mockResolvedValue(stream));
    const reliableListener = vi.fn();
    service.subscribe(() => {
      throw new Error("observer failure");
    });
    const unsubscribe = service.subscribe(reliableListener);

    await service.start();
    expect(reliableListener).toHaveBeenCalled();
    unsubscribe();
    const callsBeforeStop = reliableListener.mock.calls.length;
    service.stop();
    expect(reliableListener).toHaveBeenCalledTimes(callsBeforeStop);
  });

  it("disposes the stream and rejects future starts", async () => {
    const { stream, tracks } = createFakeStream();
    const service = createService(vi.fn().mockResolvedValue(stream));
    await service.start();

    service.dispose();
    service.dispose();

    expect(tracks[0].stop).toHaveBeenCalledOnce();
    await expect(service.start()).rejects.toBeInstanceOf(CameraServiceError);
    await expect(service.start()).rejects.toMatchObject({
      failure: { code: "service-disposed" },
    });
  });

  it("cancels a pending request when disposed", async () => {
    const pending = deferred<MediaStream>();
    const service = createService(vi.fn(() => pending.promise));
    const start = service.start();
    const { stream, tracks } = createFakeStream();

    service.dispose();
    pending.resolve(stream);

    await expect(start).rejects.toMatchObject({
      failure: { code: "request-cancelled" },
    });
    expect(tracks[0].stop).toHaveBeenCalledOnce();
  });
});
