import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_CAMERA_CONFIG } from "../../camera/cameraConstraints";
import {
  MAX_CAMERA_RECOVERY_ATTEMPTS,
  planCameraRecovery,
} from "../../camera/cameraRecovery";
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
  recoveryAttempt: number;
  recoveryScheduled: boolean;
};

export type CameraLabActions = {
  start(): Promise<void>;
  stop(): void;
  restart(): Promise<void>;
  selectDevice(deviceId: string): Promise<void>;
  refreshDevices(): Promise<void>;
  retryNow(): Promise<void>;
  cancelRecovery(): void;
};

const INITIAL_STATE: CameraLabState = {
  status: "idle",
  session: null,
  devices: [],
  selectedDeviceId: "",
  failure: null,
  loadingDevices: true,
  operationPending: false,
  recoveryAttempt: 0,
  recoveryScheduled: false,
};

export function useCameraLab(
  runtimeFactory: CameraLabRuntimeFactory = createBrowserCameraLabRuntime,
): CameraLabState & CameraLabActions {
  const [state, setState] = useState<CameraLabState>(INITIAL_STATE);
  const runtimeRef = useRef<CameraLabRuntime | null>(null);
  const selectedDeviceIdRef = useRef("");
  const recoveryAttemptsRef = useRef(0);
  const recoveryTimerRef = useRef<number | null>(null);

  const cancelRecoveryTimer = useCallback(() => {
    if (recoveryTimerRef.current !== null) {
      window.clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
  }, []);

  const openCamera = useCallback(async (runtime: CameraLabRuntime) => {
    setState((current) => ({ ...current, operationPending: true }));
    try {
      await runtime.service.start(
        configForSelectedDevice(selectedDeviceIdRef.current),
      );
    } catch {
      // The service publishes the normalized failure event.
    } finally {
      setState((current) => ({ ...current, operationPending: false }));
    }
  }, []);

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
      selectedDeviceIdRef.current = selection.device?.deviceId ?? "";
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
        cancelRecoveryTimer();
        recoveryAttemptsRef.current = 0;
        setState((current) => ({
          ...current,
          session: event.session,
          failure: null,
          recoveryAttempt: 0,
          recoveryScheduled: false,
        }));
        void loadDevices(runtime);
      } else if (event.type === "session-stopped") {
        setState((current) => ({ ...current, session: null }));
      } else if (event.type === "failure") {
        const plan = planCameraRecovery(
          event.failure,
          recoveryAttemptsRef.current,
        );
        if (!plan) {
          setState((current) => ({
            ...current,
            failure: event.failure,
            recoveryScheduled: false,
          }));
          return;
        }

        recoveryAttemptsRef.current = plan.attempt;
        setState((current) => ({
          ...current,
          failure: event.failure,
          status: "recovering",
          recoveryAttempt: plan.attempt,
          recoveryScheduled: true,
        }));
        cancelRecoveryTimer();
        recoveryTimerRef.current = window.setTimeout(() => {
          recoveryTimerRef.current = null;
          setState((current) => ({
            ...current,
            recoveryScheduled: false,
          }));
          void openCamera(runtime);
        }, plan.delayMs);
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
      selectedDeviceIdRef.current = devices.some(
        (device) => device.deviceId === selectedDeviceIdRef.current,
      )
        ? selectedDeviceIdRef.current
        : "";
      void loadDevices(runtime);
    });

    void loadDevices(runtime);

    return () => {
      active = false;
      cancelRecoveryTimer();
      runtimeRef.current = null;
      unsubscribeDevices();
      unsubscribeService();
      runtime.service.dispose();
    };
  }, [cancelRecoveryTimer, loadDevices, openCamera, runtimeFactory]);

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
      recoveryAttemptsRef.current = 0;
      cancelRecoveryTimer();
      await openCamera(runtime);
    } catch {
      // The service publishes the normalized failure event.
    } finally {
      setState((current) => ({ ...current, operationPending: false }));
    }
  }, [cancelRecoveryTimer, openCamera]);

  const stop = useCallback(() => {
    runtimeRef.current?.service.stop();
    cancelRecoveryTimer();
    recoveryAttemptsRef.current = 0;
    setState((current) => ({
      ...current,
      failure: null,
      operationPending: false,
      recoveryAttempt: 0,
      recoveryScheduled: false,
    }));
  }, [cancelRecoveryTimer]);

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
      recoveryAttemptsRef.current = 0;
      cancelRecoveryTimer();
      await runtime.service.restart(
        configForSelectedDevice(selectedDeviceIdRef.current),
      );
    } catch {
      // The service publishes the normalized failure event.
    } finally {
      setState((current) => ({ ...current, operationPending: false }));
    }
  }, [cancelRecoveryTimer]);

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
      selectedDeviceIdRef.current = selected.deviceId;

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

  const retryNow = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }

    cancelRecoveryTimer();
    setState((current) => ({
      ...current,
      failure: null,
      recoveryScheduled: false,
    }));
    await openCamera(runtime);
  }, [cancelRecoveryTimer, openCamera]);

  const cancelRecovery = useCallback(() => {
    cancelRecoveryTimer();
    recoveryAttemptsRef.current = MAX_CAMERA_RECOVERY_ATTEMPTS;
    setState((current) => ({
      ...current,
      status: current.session ? "active" : "error",
      recoveryScheduled: false,
    }));
  }, [cancelRecoveryTimer]);

  return {
    ...state,
    start,
    stop,
    restart,
    selectDevice,
    refreshDevices,
    retryNow,
    cancelRecovery,
  };
}

function configForSelectedDevice(deviceId: string) {
  return {
    ...DEFAULT_CAMERA_CONFIG,
    ...(deviceId ? { deviceId } : {}),
  };
}
