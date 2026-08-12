import { describe, expect, it } from "vitest";
import type { VisionLandmark } from "../../vision/visionTypes";
import {
  COLORS,
  paintOverlay,
  type OverlayFrame,
  type OverlayTarget,
} from "./overlayPainter";
import { FINGERTIPS, HAND } from "./poseGraph";

type Call =
  | { kind: "line"; from: [number, number]; to: [number, number]; color: string }
  | { kind: "dot"; at: [number, number]; color: string };

/** Records what would have been drawn, so the painter can be asserted without a canvas. */
function recorder() {
  const calls: Call[] = [];
  let pending: [number, number] | null = null;
  const target: OverlayTarget = {
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
    lineCap: "butt",
    shadowBlur: 0,
    shadowColor: "",
    beginPath: () => undefined,
    moveTo: (x, y) => {
      pending = [x, y];
    },
    lineTo: (x, y) => {
      if (pending) {
        calls.push({
          kind: "line",
          from: pending,
          to: [x, y],
          color: String(target.strokeStyle),
        });
        pending = null;
      }
    },
    stroke: () => undefined,
    arc: (x, y) => {
      calls.push({ kind: "dot", at: [x, y], color: String(target.fillStyle) });
    },
    fill: () => undefined,
  };
  return { target, calls };
}

const projection = { toX: (x: number) => x * 100, toY: (y: number) => y * 100, scale: 1 };

function landmark(x: number, y: number, visibility: number): VisionLandmark {
  return { x, y, z: 0, visibility };
}

/** A hand exactly as the vision worker delivers one: visibility is always zero. */
function handWithoutVisibility(): OverlayFrame["hands"][number] {
  return {
    landmarks: Array.from({ length: 21 }, (_, index) =>
      landmark(0.4 + index * 0.01, 0.5 + index * 0.005, 0),
    ),
  };
}

function pose(visibility: number) {
  return {
    landmarks: Array.from({ length: 33 }, (_, index) =>
      landmark(0.3 + (index % 6) * 0.05, 0.2 + Math.floor(index / 6) * 0.1, visibility),
    ),
  };
}

describe("overlay painter", () => {
  /**
   * Regression: MediaPipe's hand landmarker reports no visibility, which normalizes to 0.
   * Gating hands on the pose threshold silently dropped every hand segment, so the hand
   * overlay never appeared on screen.
   */
  it("draws hands even though hand landmarks report zero visibility", () => {
    const { target, calls } = recorder();

    paintOverlay(target, { pose: undefined, hands: [handWithoutVisibility()] }, projection);

    const handLines = calls.filter(
      (call) => call.kind === "line" && call.color === COLORS.hand,
    );
    expect(handLines).toHaveLength(HAND.length);
  });

  it("marks each fingertip so the hand shape reads at a distance", () => {
    const { target, calls } = recorder();

    paintOverlay(target, { pose: undefined, hands: [handWithoutVisibility()] }, projection);

    const tips = calls.filter(
      (call) => call.kind === "dot" && call.color === COLORS.fingertip,
    );
    expect(tips).toHaveLength(FINGERTIPS.length);
  });

  it("draws both hands when two are tracked", () => {
    const { target, calls } = recorder();

    paintOverlay(
      target,
      { pose: undefined, hands: [handWithoutVisibility(), handWithoutVisibility()] },
      projection,
    );

    const handLines = calls.filter(
      (call) => call.kind === "line" && call.color === COLORS.hand,
    );
    expect(handLines).toHaveLength(HAND.length * 2);
  });

  it("still hides pose limbs the tracker cannot see", () => {
    const visible = recorder();
    paintOverlay(visible.target, { pose: pose(0.9), hands: [] }, projection);
    expect(visible.calls.some((call) => call.color === COLORS.arms)).toBe(true);

    const hidden = recorder();
    paintOverlay(hidden.target, { pose: pose(0.1), hands: [] }, projection);
    expect(hidden.calls.some((call) => call.color === COLORS.arms)).toBe(false);
    expect(hidden.calls.some((call) => call.color === COLORS.body)).toBe(false);
  });

  it("projects landmarks through the supplied mapping", () => {
    const { target, calls } = recorder();

    paintOverlay(
      target,
      {
        pose: undefined,
        hands: [{ landmarks: Array.from({ length: 21 }, () => landmark(0.5, 0.25, 0)) }],
      },
      projection,
    );

    const line = calls.find((call) => call.kind === "line");
    expect(line).toBeDefined();
    expect(line).toMatchObject({ from: [50, 25], to: [50, 25] });
  });

  it("renders nothing but does not throw when there is no tracking at all", () => {
    const { target, calls } = recorder();
    paintOverlay(target, { pose: undefined, hands: [] }, projection);
    expect(calls).toHaveLength(0);
  });
});
