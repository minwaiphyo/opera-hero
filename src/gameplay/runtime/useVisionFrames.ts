/**
 * Feeds camera frames to the vision worker and publishes the landmarks it returns.
 *
 * Results land in a ref rather than React state: frames arrive at camera rate, and
 * re-rendering the game thirty times a second would be waste. The game reads the latest
 * frame when it ticks; the mirror reads it when it paints.
 *
 * No frame leaves this module. Nothing is recorded, written to disk, or uploaded.
 */

import { useEffect, useRef, useState, type RefObject } from "react";
import { calculateVisionCaptureSize } from "../../vision/visionCapture";
import {
  assessVisionTracking,
  type VisionTrackingAssessment,
} from "../../vision/visionQuality";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";
import {
  createVisionWorker,
  VisionWorkerClient,
  type VisionWorkerState,
} from "../../vision/visionWorkerClient";

export interface LatestFrame {
  frame: VisionLandmarkFrame | null;
  assessment: VisionTrackingAssessment | null;
  /** `performance.now()` when it arrived, for staleness checks. */
  receivedAt: number;
}

export interface VisionFeed {
  read: () => LatestFrame;
  worker: VisionWorkerState;
}

const EMPTY: LatestFrame = { frame: null, assessment: null, receivedAt: 0 };

export function useVisionFrames(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  onFrame?: (frame: VisionLandmarkFrame) => void,
): VisionFeed {
  const latest = useRef<LatestFrame>(EMPTY);
  const onFrameRef = useRef(onFrame);
  const [worker, setWorker] = useState<VisionWorkerState>({ status: "idle" });

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video) {
      setWorker({ status: "idle" });
      return;
    }

    let cancelled = false;
    let handle = 0;
    let nextFrameId = 0;
    let lastVideoTime = -1;
    let pending = false;

    const client = new VisionWorkerClient(createVisionWorker(), {
      onStateChange: (state) => {
        if (!cancelled) {
          setWorker(state);
        }
      },
      onFrame: (frame) => {
        if (cancelled) {
          return;
        }
        latest.current = {
          frame,
          assessment: assessVisionTracking(frame),
          receivedAt: performance.now(),
        };
        onFrameRef.current?.(frame);
      },
    });

    const capture = () => {
      handle = requestAnimationFrame(capture);
      if (
        !client.isReady() ||
        pending ||
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.currentTime === lastVideoTime
      ) {
        return;
      }

      lastVideoTime = video.currentTime;
      pending = true;
      const frameId = nextFrameId++;
      // The worker can have a different time origin, so carry an epoch timestamp.
      const capturedAtMs = performance.timeOrigin + performance.now();
      const size = calculateVisionCaptureSize(video.videoWidth, video.videoHeight);

      void createImageBitmap(video, {
        resizeWidth: size.width,
        resizeHeight: size.height,
        resizeQuality: "low",
      })
        .then((bitmap) => {
          if (cancelled) {
            bitmap.close();
            return;
          }
          client.submit({ frameId, capturedAtMs, bitmap });
        })
        .catch(() => undefined)
        .finally(() => {
          pending = false;
        });
    };

    setWorker({ status: "loading" });
    handle = requestAnimationFrame(capture);

    return () => {
      cancelled = true;
      cancelAnimationFrame(handle);
      client.dispose();
      latest.current = EMPTY;
      setWorker({ status: "idle" });
    };
  }, [enabled, videoRef]);

  const read = useRef(() => latest.current).current;

  return { read, worker };
}
