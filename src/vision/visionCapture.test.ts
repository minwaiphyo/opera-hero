import { describe, expect, it } from "vitest";
import {
  calculateVisionCaptureSize,
  VISION_INFERENCE_MAX_EDGE_PX,
} from "./visionCapture";

describe("calculateVisionCaptureSize", () => {
  it("bounds a landscape frame while preserving its aspect ratio", () => {
    expect(calculateVisionCaptureSize(1280, 720)).toEqual({
      width: 640,
      height: 360,
    });
  });

  it("bounds portrait frames by their longest edge", () => {
    expect(calculateVisionCaptureSize(720, 1280)).toEqual({
      width: 360,
      height: 640,
    });
  });

  it("does not upscale smaller camera frames", () => {
    expect(calculateVisionCaptureSize(320, 240)).toEqual({
      width: 320,
      height: 240,
    });
  });

  it("supports an explicit cap and rejects invalid dimensions", () => {
    expect(calculateVisionCaptureSize(1920, 1080, 960)).toEqual({
      width: 960,
      height: 540,
    });
    expect(VISION_INFERENCE_MAX_EDGE_PX).toBe(640);
    expect(() => calculateVisionCaptureSize(0, 720)).toThrow(RangeError);
  });
});
