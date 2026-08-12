/**
 * Camera lifecycle for the booth.
 *
 * Thinner than the camera laboratory's hook on purpose: there is no device picker and
 * nobody to press "start", so this opens the preferred camera on mount and retries
 * through the approved recovery plan. Device selection and diagnostics stay in the lab.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMediaDevices } from "../../camera/browserMediaDevices";
import { DEFAULT_CAMERA_CONFIG } from "../../camera/cameraConstraints";
import { planCameraRecovery } from "../../camera/cameraRecovery";
import { CameraService } from "../../camera/cameraService";
import type {
  CameraFailure,
  CameraSession,
  CameraStatus,
} from "../../camera/cameraTypes";

export interface BoothCamera {
  status: CameraStatus;
  session: CameraSession | null;
  failure: CameraFailure | null;
  /** True when a stream is live. */
  ready: boolean;
  retry(): void;
}

export type CameraServiceFactory = () => CameraService;

const browserCameraService: CameraServiceFactory = () =>
  new CameraService(new BrowserMediaDevices());

export function useBoothCamera(
  createService: CameraServiceFactory = browserCameraService,
): BoothCamera {
  const [state, setState] = useState<Omit<BoothCamera, "retry">>({
    status: "idle",
    session: null,
    failure: null,
    ready: false,
  });
  const serviceRef = useRef<CameraService | null>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const open = useCallback(async (service: CameraService) => {
    try {
      await service.start(DEFAULT_CAMERA_CONFIG);
    } catch {
      // The service publishes a normalized failure event.
    }
  }, []);

  useEffect(() => {
    const service = createService();
    serviceRef.current = service;
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
          void open(service);
        }, plan.delayMs);
      }
    });

    void open(service);

    return () => {
      active = false;
      clearTimer();
      unsubscribe();
      serviceRef.current = null;
      service.dispose();
    };
  }, [clearTimer, createService, open]);

  const retry = useCallback(() => {
    const service = serviceRef.current;
    if (!service) {
      return;
    }
    clearTimer();
    attemptsRef.current = 0;
    setState((current) => ({ ...current, failure: null }));
    void open(service);
  }, [clearTimer, open]);

  return { ...state, retry };
}
