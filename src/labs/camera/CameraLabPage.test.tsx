import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCameraFailure } from "../../camera/cameraErrors";
import type {
  CameraConfig,
  CameraDevice,
  CameraEvent,
  CameraEventListener,
  CameraSession,
  CameraStatus,
  CameraStopReason,
} from "../../camera/cameraTypes";
import { CameraLabPage } from "./CameraLabPage";
import type {
  CameraCatalogController,
  CameraLabRuntime,
  CameraServiceController,
} from "./cameraLabRuntime";

vi.mock("./WaterSleevesReferenceGuide", () => ({
  WaterSleevesReferenceGuide: () => <div>Water Sleeves reference guide</div>,
}));

vi.mock("./OpeningDoorReferenceGuide", () => ({
  OpeningDoorReferenceGuide: () => <div>Opening Door reference guide</div>,
}));

vi.mock("./OrchidFingerReferenceGuide", () => ({
  OrchidFingerReferenceGuide: () => <div>Orchid Finger reference guide</div>,
}));

const devices: CameraDevice[] = [
  { deviceId: "integrated", label: "Integrated Camera" },
  { deviceId: "external", label: "USB Camera" },
];

function createStream(): MediaStream {
  return {
    getTracks: () => [],
    getVideoTracks: () => [],
  } as unknown as MediaStream;
}

class FakeCameraService implements CameraServiceController {
  status: CameraStatus = "idle";
  session: CameraSession | null = null;
  listeners = new Set<CameraEventListener>();

  start = vi.fn(async (_config?: CameraConfig) => {
    void _config;
    this.emit({ type: "status-changed", status: "starting" });
    this.session = {
      id: "session-for-camera-lab",
      startedAt: performance.now(),
      stream: createStream(),
      settings: {
        deviceId: "integrated",
        width: 1280,
        height: 720,
        frameRate: 30,
        facingMode: "user",
      },
    };
    this.emit({ type: "status-changed", status: "active" });
    this.emit({ type: "session-started", session: this.session });
    return this.session;
  });

  stop = vi.fn((_reason?: CameraStopReason) => {
    void _reason;
    const session = this.session;
    this.session = null;
    this.emit({ type: "status-changed", status: "stopped" });
    if (session) {
      this.emit({
        type: "session-stopped",
        sessionId: session.id,
        reason: "requested",
      });
    }
  });

  restart = vi.fn(async (config?: CameraConfig) => {
    this.stop("restart");
    return this.start(config);
  });

  dispose = vi.fn();

  getStatus(): CameraStatus {
    return this.status;
  }

  getSession(): CameraSession | null {
    return this.session;
  }

  subscribe(listener: CameraEventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: CameraEvent): void {
    if (event.type === "status-changed") {
      this.status = event.status;
    }
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

class FakeCameraCatalog implements CameraCatalogController {
  listener: ((nextDevices: CameraDevice[]) => void) | null = null;
  unsubscribe = vi.fn();

  listCameras = vi.fn(async () => devices);
  resolveSelection = vi.fn(async () => ({ device: devices[0] }));
  setPreferredDevice = vi.fn(
    async (deviceId: string) =>
      devices.find((device) => device.deviceId === deviceId) ?? null,
  );

  subscribe(listener: (nextDevices: CameraDevice[]) => void) {
    this.listener = listener;
    return () => {
      this.listener = null;
      this.unsubscribe();
    };
  }
}

function createRuntime() {
  const service = new FakeCameraService();
  const catalog = new FakeCameraCatalog();
  const runtime: CameraLabRuntime = { service, catalog };
  return { runtime, service, catalog };
}

describe("CameraLabPage", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("loads devices and starts and stops a visible session", async () => {
    const { runtime, service } = createRuntime();
    render(<CameraLabPage runtimeFactory={() => runtime} />);

    const selector = await screen.findByLabelText("Available camera");
    await waitFor(() => {
      expect(selector).toBeEnabled();
      expect(selector).toHaveValue("integrated");
    });
    expect(screen.getByText(/2 cameras detected/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Stability monitor" }),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start camera" }));
    });

    expect(service.start).toHaveBeenCalledWith(
      expect.objectContaining({ deviceId: "integrated" }),
    );
    expect(screen.getByText("16:9")).toBeInTheDocument();
    expect(screen.getByText("Live · local only")).toBeInTheDocument();
    expect(screen.getAllByText("1280 × 720 @ 30 FPS")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(service.stop).toHaveBeenCalled();
    expect(screen.getByText("Preview is stopped")).toBeInTheDocument();
  });

  it("stores a selected camera without starting an idle stream", async () => {
    const { runtime, service, catalog } = createRuntime();
    render(<CameraLabPage runtimeFactory={() => runtime} />);

    const selector = await screen.findByLabelText("Available camera");
    await waitFor(() => expect(selector).toBeEnabled());
    await act(async () => {
      fireEvent.change(selector, { target: { value: "external" } });
    });

    expect(catalog.setPreferredDevice).toHaveBeenCalledWith("external");
    expect(selector).toHaveValue("external");
    expect(service.restart).not.toHaveBeenCalled();
  });

  it("restarts an active stream when the technician changes camera", async () => {
    const { runtime, service } = createRuntime();
    render(<CameraLabPage runtimeFactory={() => runtime} />);
    const selector = await screen.findByLabelText("Available camera");
    await waitFor(() => expect(selector).toBeEnabled());

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start camera" }));
    });
    await act(async () => {
      fireEvent.change(selector, { target: { value: "external" } });
    });

    expect(service.restart).toHaveBeenCalledWith(
      expect.objectContaining({ deviceId: "external" }),
    );
  });

  it("disposes services and subscriptions on unmount", async () => {
    const { runtime, service, catalog } = createRuntime();
    const { unmount } = render(
      <CameraLabPage runtimeFactory={() => runtime} />,
    );

    await waitFor(() => expect(catalog.listCameras).toHaveBeenCalled());
    unmount();

    expect(service.dispose).toHaveBeenCalledOnce();
    expect(catalog.unsubscribe).toHaveBeenCalledOnce();
  });

  it("automatically retries a recoverable failure", async () => {
    vi.useFakeTimers();
    const { runtime, service } = createRuntime();
    render(<CameraLabPage runtimeFactory={() => runtime} />);
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      service.emit({ type: "status-changed", status: "error" });
      service.emit({
        type: "failure",
        failure: createCameraFailure("camera-busy"),
      });
    });

    expect(screen.getByText("Recovery attempt 1 of 2")).toBeInTheDocument();
    expect(service.start).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });

    expect(service.start).toHaveBeenCalledOnce();
    expect(screen.getByText("Live · local only")).toBeInTheDocument();
  });

  it("allows automatic recovery to be cancelled", async () => {
    vi.useFakeTimers();
    const { runtime, service } = createRuntime();
    render(<CameraLabPage runtimeFactory={() => runtime} />);
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      service.emit({
        type: "failure",
        failure: createCameraFailure("device-disconnected"),
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "Stop recovery" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(service.start).not.toHaveBeenCalled();
    expect(screen.getByText("Camera needs attention")).toBeInTheDocument();
  });

  it("switches among all three gesture scoring tools", async () => {
    const { runtime } = createRuntime();
    render(<CameraLabPage runtimeFactory={() => runtime} />);
    await screen.findByLabelText("Available camera");

    expect(screen.getByRole("heading", { name: "Water Sleeves live scoring" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Gesture laboratory"), {
      target: { value: "opening-door" },
    });

    expect(screen.getByRole("heading", { name: "Opening Door live scoring" })).toBeInTheDocument();
    expect(screen.getByText("Opening Door reference guide")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Gesture laboratory"), {
      target: { value: "orchid-finger" },
    });
    expect(screen.getByRole("heading", { name: "Orchid Finger live scoring" })).toBeInTheDocument();
    expect(screen.getByText("Orchid Finger reference guide")).toBeInTheDocument();
  });

  it("does not automatically retry permission denial", async () => {
    vi.useFakeTimers();
    const { runtime, service } = createRuntime();
    render(<CameraLabPage runtimeFactory={() => runtime} />);
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      service.emit({
        type: "failure",
        failure: createCameraFailure("permission-denied"),
      });
    });

    expect(screen.getByText("Camera needs attention")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Stop recovery" }),
    ).not.toBeInTheDocument();
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(service.start).not.toHaveBeenCalled();
  });
});
