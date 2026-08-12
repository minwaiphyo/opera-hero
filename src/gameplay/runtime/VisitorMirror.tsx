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
    const context = canvas?.getContext("2d") ?? null;
    if (!canvas || !context) {
      return;
    }

    let handle = 0;
    const paint = () => {
      handle = requestAnimationFrame(paint);
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.round(box.width * dpr);
      const height = Math.round(box.height * dpr);
      if (width === 0 || height === 0) {
        return;
      }
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Cover-fit the camera picture into the circle, mirrored like a mirror.
      const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
      const drawWidth = video.videoWidth * scale;
      const drawHeight = video.videoHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      context.clearRect(0, 0, width, height);
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

    handle = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(handle);
  }, [read, showOverlay, videoRef]);

  return <canvas aria-hidden="true" className="mirror-canvas" ref={canvasRef} />;
}
