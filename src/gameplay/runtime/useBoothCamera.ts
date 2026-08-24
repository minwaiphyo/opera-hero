/**
 * Camera lifecycle for the booth.
 *
 * Thinner than the camera laboratory's hook on purpose: there is no device picker and
 * nobody to press "start", so this opens the preferred camera on mount and retries
 * through the approved recovery plan. Device selection and diagnostics stay in the lab.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMediaDevices } from "../../camera/browserMediaDevices";
import { CameraDeviceCatalog } from "../../camera/cameraDeviceCatalog";
import { CameraPreferenceStore } from "../../camera/cameraPreferences";
import { DEFAULT_CAMERA_CONFIG } from "../../camera/cameraConstraints";
import { planCameraRecovery } from "../../camera/cameraRecovery";
import { CameraService } from "../../camera/cameraService";
import type {
  CameraConfig,
  CameraFailure,
  CameraSession,
  CameraStatus,
} from "../../camera/cameraTypes";

type CameraSelectionResolver = Pick<CameraDeviceCatalog, "resolveSelection">;

export async function resolveBoothCameraConfig(
  catalog: CameraSelectionResolver,
): Promise<CameraConfig> {
  const selection = await catalog.resolveSelection().catch(() => ({
    device: null,
  }));
  return {
    ...DEFAULT_CAMERA_CONFIG,
    ...(selection.device ? { deviceId: selection.device.deviceId } : {}),
  };
}

export interface BoothCamera {
  status: CameraStatus;
  session: CameraSession | null;
  failure: CameraFailure | null;
  /** True when a stream is live. */
  ready: boolean;
  retry(): void;
}

export interface BoothCameraRuntime {
  service: CameraService;
  catalog: CameraDeviceCatalog;
}

export type BoothCameraRuntimeFactory = () => BoothCameraRuntime;

const createBrowserBoothCameraRuntime: BoothCameraRuntimeFactory = () => {
  const mediaDevices = new BrowserMediaDevices();
  return {
    service: new CameraService(mediaDevices),
    catalog: new CameraDeviceCatalog(mediaDevices, new CameraPreferenceStore()),
  };
};

export function useBoothCamera(
  createRuntime: BoothCameraRuntimeFactory = createBrowserBoothCameraRuntime,
): BoothCamera {
  const [state, setState] = useState<Omit<BoothCamera, "retry">>({
    status: "idle",
    session: null,
    failure: null,
    ready: false,
  });
  const runtimeRef = useRef<BoothCameraRuntime | null>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const open = useCallback(async (runtime: BoothCameraRuntime) => {
    try {
      await runtime.service.start(await resolveBoothCameraConfig(runtime.catalog));
    } catch {
      // The service publishes a normalized failure event.
    }
  }, []);

  useEffect(() => {
    const runtime = createRuntime();
    const { service } = runtime;
    runtimeRef.current = runtime;
    let active = true;

    const unsubscribe = service.subscribe((event) => {
      if (!active) {
        return;
      }
      if (event.type === "status-changed") {
        setState((current) => ({ ...current, status: event.status }));
      } else if (event.type === "session-started") {
        clearTimer();
        attemptsRef.current = 0;
        setState({
          status: "active",
          session: event.session,
          failure: null,
          ready: true,
        });
      } else if (event.type === "session-stopped") {
        setState((current) => ({ ...current, session: null, ready: false }));
      } else if (event.type === "failure") {
        setState((current) => ({
          ...current,
          failure: event.failure,
          session: null,
          ready: false,
        }));
        const plan = planCameraRecovery(event.failure, attemptsRef.current);
        if (!plan) {
          return;
        }
        attemptsRef.current = plan.attempt;
        clearTimer();
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          void open(runtime);
        }, plan.delayMs);
      }
    });

    void open(runtime);

    return () => {
      active = false;
      clearTimer();
      unsubscribe();
      runtimeRef.current = null;
      service.dispose();
    };
  }, [clearTimer, createRuntime, open]);

  const retry = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }
    clearTimer();
    attemptsRef.current = 0;
    setState((current) => ({ ...current, failure: null }));
    void open(runtime);
  }, [clearTimer, open]);

  return { ...state, retry };
}
