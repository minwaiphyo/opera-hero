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
import type { VisionLandmark } from "../../vision/visionTypes";
import { ARMS, BODY, HAND, JOINTS } from "./poseGraph";
import type { LatestFrame } from "./useVisionFrames";

const VISIBLE = 0.4;

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
      const toX = (x: number) => width - (offsetX + x * drawWidth);
      const toY = (y: number) => offsetY + y * drawHeight;
      const pose = frame.pose?.landmarks;

      if (pose) {
        stroke(context, pose, BODY, toX, toY, "rgba(228, 184, 95, 0.5)", 3 * dpr);

        context.shadowBlur = 16 * dpr;
        context.shadowColor = "rgba(249, 227, 171, 0.65)";
        stroke(context, pose, ARMS, toX, toY, "rgba(249, 227, 171, 0.95)", 5 * dpr);
        context.shadowBlur = 0;

        context.fillStyle = "rgba(249, 227, 171, 0.95)";
        for (const index of JOINTS) {
          const point = pose[index];
          if (point && point.visibility >= VISIBLE) {
            context.beginPath();
            context.arc(toX(point.x), toY(point.y), 4 * dpr, 0, Math.PI * 2);
            context.fill();
          }
        }
      }

      for (const hand of frame.hands) {
        stroke(context, hand.landmarks, HAND, toX, toY, "rgba(242, 135, 159, 0.9)", 2.5 * dpr);
      }
    };

    handle = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(handle);
  }, [read, showOverlay, videoRef]);

  return <canvas aria-hidden="true" className="mirror-canvas" ref={canvasRef} />;
}

function stroke(
  context: CanvasRenderingContext2D,
  points: readonly VisionLandmark[],
  connections: readonly (readonly [number, number])[],
  toX: (x: number) => number,
  toY: (y: number) => number,
  color: string,
  lineWidth: number,
): void {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.beginPath();
  for (const [from, to] of connections) {
    const a = points[from];
    const b = points[to];
    if (!a || !b || (a.visibility ?? 1) < VISIBLE || (b.visibility ?? 1) < VISIBLE) {
      continue;
    }
    context.moveTo(toX(a.x), toY(a.y));
    context.lineTo(toX(b.x), toY(b.y));
  }
  context.stroke();
}
