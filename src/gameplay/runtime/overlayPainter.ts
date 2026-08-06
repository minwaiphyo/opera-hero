/**
 * Draws the visitor's tracked body and hands over their mirrored image.
 *
 * Split out from the canvas component so it can be tested without a camera or a DOM.
 *
 * IMPORTANT — hands carry no visibility. MediaPipe's hand landmarker does not populate
 * `visibility`, and `mediapipeNormalization` turns the missing value into 0. Gating hand
 * segments on the same threshold as pose landmarks therefore discards every one of them,
 * which is exactly the bug that made the hand overlay invisible. Pose is gated; hands are
 * drawn whenever the hand is present at all.
 */

import type { VisionLandmark } from "../../vision/visionTypes";
import { ARMS, BODY, FINGERTIPS, HAND, JOINTS } from "./poseGraph";

/** The slice of `CanvasRenderingContext2D` the painter uses. */
export interface OverlayTarget {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  lineCap: CanvasLineCap;
  shadowBlur: number;
  shadowColor: string;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  arc(x: number, y: number, radius: number, start: number, end: number): void;
  fill(): void;
}

export interface OverlayFrame {
  readonly pose?: { readonly landmarks: readonly VisionLandmark[] } | undefined;
  readonly hands: readonly { readonly landmarks: readonly VisionLandmark[] }[];
}

export interface OverlayProjection {
  toX(x: number): number;
  toY(y: number): number;
  /** Device pixel ratio, so line weights hold up on a high-density display. */
  scale: number;
}

/** Pose landmarks below this are not drawn; hands are exempt (see the note above). */
export const POSE_VISIBILITY_FLOOR = 0.4;

export const COLORS = {
  body: "rgba(228, 184, 95, 0.5)",
  arms: "rgba(249, 227, 171, 0.95)",
  joints: "rgba(249, 227, 171, 0.95)",
  hand: "rgba(242, 135, 159, 0.92)",
  fingertip: "rgba(255, 214, 224, 0.98)",
} as const;

export function paintOverlay(
  target: OverlayTarget,
  frame: OverlayFrame,
  projection: OverlayProjection,
): void {
  const { scale } = projection;
  const pose = frame.pose?.landmarks;

  if (pose) {
    strokeConnections(target, pose, BODY, projection, {
      color: COLORS.body,
      width: 3 * scale,
      minVisibility: POSE_VISIBILITY_FLOOR,
    });

    target.shadowBlur = 16 * scale;
    target.shadowColor = "rgba(249, 227, 171, 0.65)";
    strokeConnections(target, pose, ARMS, projection, {
      color: COLORS.arms,
      width: 5 * scale,
      minVisibility: POSE_VISIBILITY_FLOOR,
    });
    target.shadowBlur = 0;

    target.fillStyle = COLORS.joints;
    for (const index of JOINTS) {
      const point = pose[index];
      if (point && point.visibility >= POSE_VISIBILITY_FLOOR) {
        dot(target, projection, point, 4 * scale);
      }
    }
  }

  // The hands are the point of Orchid Finger, so they are drawn brighter than the body
  // and their fingertips are marked to make the shape readable at two metres.
  for (const hand of frame.hands) {
    target.shadowBlur = 10 * scale;
    target.shadowColor = "rgba(242, 135, 159, 0.55)";
    strokeConnections(target, hand.landmarks, HAND, projection, {
      color: COLORS.hand,
      width: 3 * scale,
      minVisibility: 0,
    });
    target.shadowBlur = 0;

    target.fillStyle = COLORS.fingertip;
    for (const index of FINGERTIPS) {
      const point = hand.landmarks[index];
      if (point) {
        dot(target, projection, point, 3.5 * scale);
      }
    }
  }
}

function strokeConnections(
  target: OverlayTarget,
  points: readonly VisionLandmark[],
  connections: readonly (readonly [number, number])[],
  { toX, toY }: OverlayProjection,
  style: { color: string; width: number; minVisibility: number },
): void {
  target.strokeStyle = style.color;
  target.lineWidth = style.width;
  target.lineCap = "round";
  target.beginPath();
  for (const [from, to] of connections) {
    const a = points[from];
    const b = points[to];
    if (!a || !b) {
      continue;
    }
    if (a.visibility < style.minVisibility || b.visibility < style.minVisibility) {
      continue;
    }
    target.moveTo(toX(a.x), toY(a.y));
    target.lineTo(toX(b.x), toY(b.y));
  }
  target.stroke();
}

function dot(
  target: OverlayTarget,
  { toX, toY }: OverlayProjection,
  point: VisionLandmark,
  radius: number,
): void {
  target.beginPath();
  target.arc(toX(point.x), toY(point.y), radius, 0, Math.PI * 2);
  target.fill();
}
