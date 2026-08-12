/**
 * The visitor, mirrored, with their tracked movement drawn over them in real time.
 *
 * This is the heart of the booth: people need to see themselves and see that the stage is
 * following them. It paints the live camera picture like a dressing-room mirror and draws
 * the pose and hand landmarks on top at animation rate.
 *
 * Nothing is captured or stored — it reads the same in-memory video element the vision
 * worker samples and paints straight to a canvas.
 */

import { useEffect, useRef, type RefObject } from "react";
import { paintOverlay } from "./overlayPainter";
import type { LatestFrame } from "./useVisionFrames";

export function VisitorMirror({
  videoRef,
  read,
  showOverlay = true,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  read: () => LatestFrame;
  showOverlay?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext("2d", {
      alpha: false,
      desynchronized: true,
    }) ?? null;
    if (!canvas || !context || !video) {
      return;
    }

    let animationHandle = 0;
    let videoFrameHandle = 0;
    let stopped = false;

    const schedule = () => {
      if (stopped) {
        return;
      }
      if (video && "requestVideoFrameCallback" in video) {
        videoFrameHandle = video.requestVideoFrameCallback(() => paint());
      } else {
        animationHandle = requestAnimationFrame(paint);
      }
    };

    const paint = () => {
      schedule();
      if (video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      const box = canvas.getBoundingClientRect();
      // The camera mirror is motion feedback, not a still image. Painting it at 2x on
      // the 3200x2000 development display quadrupled the per-frame pixel workload and
      // made the game lag while the native-video camera lab stayed smooth.
      const dpr = 1;
      const width = Math.round(box.width * dpr);
      const height = Math.round(box.height * dpr);
      if (width === 0 || height === 0) {
        return;
      }
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Match the native video's object-fit: cover projection, including its mirror.
      const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
      const drawWidth = video.videoWidth * scale;
      const drawHeight = video.videoHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      context.save();
      context.translate(width, 0);
      context.scale(-1, 1);
      context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
      context.restore();

      if (!showOverlay) {
        return;
      }
      const { frame } = read();
      if (!frame) {
        return;
      }

      // Landmarks are normalized to the camera image, so they map through the same
      // transform as the picture, including the mirroring.
      paintOverlay(context, frame, {
        toX: (x) => width - (offsetX + x * drawWidth),
        toY: (y) => offsetY + y * drawHeight,
        scale: dpr,
      });
    };

    schedule();
    return () => {
      stopped = true;
      cancelAnimationFrame(animationHandle);
      if (videoFrameHandle) {
        video.cancelVideoFrameCallback(videoFrameHandle);
      }
    };
  }, [read, showOverlay, videoRef]);

  return <canvas aria-hidden="true" className="mirror-canvas" ref={canvasRef} />;
}
