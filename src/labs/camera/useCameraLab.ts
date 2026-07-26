import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_CAMERA_CONFIG } from "../../camera/cameraConstraints";
import type {
  CameraDevice,
  CameraFailure,
  CameraSession,
  CameraStatus,
} from "../../camera/cameraTypes";
import {
  createBrowserCameraLabRuntime,
  type CameraLabRuntime,
  type CameraLabRuntimeFactory,
} from "./cameraLabRuntime";

export type CameraLabState = {
  status: CameraStatus;
  session: CameraSession | null;
  devices: CameraDevice[];
  selectedDeviceId: string;
  failure: CameraFailure | null;
  loadingDevices: boolean;
  operationPending: boolean;
};

export type CameraLabActions = {
  start(): Promise<void>;
  stop(): void;
  restart(): Promise<void>;
  selectDevice(deviceId: string): Promise<void>;
  refreshDevices(): Promise<void>;
};

const INITIAL_STATE: CameraLabState = {
  status: "idle",
  session: null,
  devices: [],
  selectedDeviceId: "",
  failure: null,
  loadingDevices: true,
  operationPending: false,
};

export function useCameraLab(
  runtimeFactory: CameraLabRuntimeFactory = createBrowserCameraLabRuntime,
): CameraLabState & CameraLabActions {
  const [state, setState] = useState<CameraLabState>(INITIAL_STATE);
  const runtimeRef = useRef<CameraLabRuntime | null>(null);

  const loadDevices = useCallback(async (runtime: CameraLabRuntime) => {
    setState((current) => ({ ...current, loadingDevices: true }));
    try {
      const devices = await runtime.catalog.listCameras();
      const selection = await runtime.catalog.resolveSelection();
      setState((current) => ({
        ...current,
        devices,
        selectedDeviceId: selection.device?.deviceId ?? "",
        loadingDevices: false,
      }));
    } catch {
      setState((current) => ({
        ...current,
        devices: [],
        selectedDeviceId: "",
        loadingDevices: false,
      }));
    }
  }, []);

  useEffect(() => {
    const runtime = runtimeFactory();
    let active = true;
    runtimeRef.current = runtime;
    setState({
      ...INITIAL_STATE,
      status: runtime.service.getStatus(),
      session: runtime.service.getSession(),
    });

    const unsubscribeService = runtime.service.subscribe((event) => {
      if (!active) {
        return;
      }

      if (event.type === "status-changed") {
        setState((current) => ({ ...current, status: event.status }));
      } else if (event.type === "session-started") {
        setState((current) => ({
          ...current,
          session: event.session,
          failure: null,
        }));
        void loadDevices(runtime);
      } else if (event.type === "session-stopped") {
        setState((current) => ({ ...current, session: null }));
      } else if (event.type === "failure") {
        setState((current) => ({ ...current, failure: event.failure }));
      }
    });

    const unsubscribeDevices = runtime.catalog.subscribe((devices) => {
      if (!active) {
        return;
      }

      setState((current) => {
        const selectedStillExists = devices.some(
          (device) => device.deviceId === current.selectedDeviceId,
        );
        return {
          ...current,
          devices,
          selectedDeviceId: selectedStillExists
            ? current.selectedDeviceId
            : "",
        };
      });
      void loadDevices(runtime);
    });

    void loadDevices(runtime);

    return () => {
      active = false;
      runtimeRef.current = null;
      unsubscribeDevices();
      unsubscribeService();
      runtime.service.dispose();
    };
  }, [loadDevices, runtimeFactory]);

  const start = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }

    setState((current) => ({
      ...current,
      failure: null,
      operationPending: true,
    }));
    try {
      await runtime.service.start(
        configForSelectedDevice(state.selectedDeviceId),
      );
    } catch {
      // The service publishes the normalized failure event.
    } finally {
      setState((current) => ({ ...current, operationPending: false }));
    }
  }, [state.selectedDeviceId]);

  const stop = useCallback(() => {
    runtimeRef.current?.service.stop();
    setState((current) => ({
      ...current,
      failure: null,
      operationPending: false,
    }));
  }, []);

  const restart = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }

    setState((current) => ({
      ...current,
      failure: null,
      operationPending: true,
    }));
    try {
      await runtime.service.restart(
        configForSelectedDevice(state.selectedDeviceId),
      );
    } catch {
      // The service publishes the normalized failure event.
    } finally {
      setState((current) => ({ ...current, operationPending: false }));
    }
  }, [state.selectedDeviceId]);

  const selectDevice = useCallback(
    async (deviceId: string) => {
      const runtime = runtimeRef.current;
      if (!runtime) {
        return;
      }

      const selected = await runtime.catalog.setPreferredDevice(deviceId);
      if (!selected) {
        await loadDevices(runtime);
        return;
      }

      setState((current) => ({
        ...current,
        selectedDeviceId: selected.deviceId,
      }));

      if (runtime.service.getStatus() === "active") {
        setState((current) => ({ ...current, operationPending: true }));
        try {
          await runtime.service.restart(configForSelectedDevice(selected.deviceId));
        } catch {
          // The service publishes the normalized failure event.
        } finally {
          setState((current) => ({ ...current, operationPending: false }));
        }
      }
    },
    [loadDevices],
  );

  const refreshDevices = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (runtime) {
      await loadDevices(runtime);
    }
  }, [loadDevices]);

  return {
    ...state,
    start,
    stop,
    restart,
    selectDevice,
    refreshDevices,
  };
}

function configForSelectedDevice(deviceId: string) {
  return {
    ...DEFAULT_CAMERA_CONFIG,
    ...(deviceId ? { deviceId } : {}),
  };
}
