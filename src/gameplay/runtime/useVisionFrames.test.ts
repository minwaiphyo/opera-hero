import { describe, expect, it } from "vitest";
import { calculateVisionCaptureSize } from "../../vision/visionCapture";
import { GAME_VISION_MAX_EDGE_PX } from "./useVisionFrames";

describe("game vision capture profile", () => {
  it("reduces a landscape worker frame without changing its aspect ratio", () => {
    expect(GAME_VISION_MAX_EDGE_PX).toBe(512);
    expect(
      calculateVisionCaptureSize(1280, 720, GAME_VISION_MAX_EDGE_PX),
    ).toEqual({ width: 512, height: 288 });
  });
});

