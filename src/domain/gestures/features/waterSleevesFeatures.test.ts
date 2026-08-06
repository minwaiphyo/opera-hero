import { describe, expect, it } from "vitest";
import type {
  VisionHand,
  VisionLandmark,
  VisionLandmarkFrame,
} from "../../../vision/visionTypes";
import { extractWaterSleevesFrameFeatures } from "./waterSleevesFeatures";

describe("extractWaterSleevesFrameFeatures", () => {
  it("is invariant to image translation and body scale", () => {
    const original = extractWaterSleevesFrameFeatures(frame());
    const transformed = extractWaterSleevesFrameFeatures(
      frame({ scale: 1.7, translateX: -0.2, translateY: 0.1 }),
    );

    expect(original?.leftArm?.elbowFromShoulder.x).toBeCloseTo(
      transformed?.leftArm?.elbowFromShoulder.x ?? 0,
    );
    expect(original?.leftArm?.elbowFromShoulder.y).toBeCloseTo(
      transformed?.leftArm?.elbowFromShoulder.y ?? 0,
    );
    expect(original?.rightArm?.wristFromShoulder?.x).toBeCloseTo(
      transformed?.rightArm?.wristFromShoulder?.x ?? 0,
    );
    expect(original?.rightArm?.wristFromShoulder?.y).toBeCloseTo(
      transformed?.rightArm?.wristFromShoulder?.y ?? 0,
    );
    expect(original?.leftArm?.upperArmAngleRad).toBeCloseTo(
      transformed?.leftArm?.upperArmAngleRad ?? 0,
    );
  });

  it("keeps upper-arm features when a wrist is obscured", () => {
    const result = extractWaterSleevesFrameFeatures(
      frame({ leftWristVisibility: 0.1 }),
    );

    expect(result?.leftArm).not.toBeNull();
    expect(result?.leftArm?.wristFromShoulder).toBeNull();
    expect(result?.leftArm?.elbowAngleRad).toBeNull();
    expect(result?.usableArmCount).toBe(2);
  });

  it("drops only an arm whose elbow is unreliable", () => {
    const result = extractWaterSleevesFrameFeatures(
      frame({ rightElbowVisibility: 0.1 }),
    );

    expect(result?.leftArm).not.toBeNull();
    expect(result?.rightArm).toBeNull();
    expect(result?.usableArmCount).toBe(1);
  });

  it("does not use Hand Landmarker detections", () => {
    const withoutHands = extractWaterSleevesFrameFeatures(frame());
    const withHands = extractWaterSleevesFrameFeatures(
      frame({ hands: [hand()] }),
    );

    expect(withoutHands).toEqual(withHands);
    expect(withHands?.handsUsed).toBe(false);
  });

  it("rejects a frame without a reliable body scale", () => {
    expect(
      extractWaterSleevesFrameFeatures(frame({ shoulderVisibility: 0.1 })),
    ).toBeNull();
  });
});

interface FrameOptions {
  scale?: number;
  translateX?: number;
  translateY?: number;
  shoulderVisibility?: number;
  leftWristVisibility?: number;
  rightElbowVisibility?: number;
  hands?: VisionHand[];
}

function frame(options: FrameOptions = {}): VisionLandmarkFrame {
  const scale = options.scale ?? 1;
  const translateX = options.translateX ?? 0;
  const translateY = options.translateY ?? 0;
  const landmarks = Array.from({ length: 33 }, () => point(0, 0, 0));
  const transform = (x: number, y: number, visibility = 0.9) =>
    point(
      x * scale + translateX,
      y * scale + translateY,
      visibility,
    );

  landmarks[11] = transform(0.4, 0.3, options.shoulderVisibility);
  landmarks[12] = transform(0.6, 0.3, options.shoulderVisibility);
  landmarks[13] = transform(0.3, 0.45);
  landmarks[14] = transform(
    0.7,
    0.45,
    options.rightElbowVisibility,
  );
  landmarks[15] = transform(0.25, 0.6, options.leftWristVisibility);
  landmarks[16] = transform(0.75, 0.6);

  return {
    frameId: 1,
    capturedAtMs: 100,
    completedAtMs: 110,
    pose: { landmarks, worldLandmarks: landmarks },
    hands: options.hands ?? [],
    timing: { poseMs: 5, handsMs: 5, totalMs: 10 },
  };
}

function point(x: number, y: number, visibility = 0.9): VisionLandmark {
  return { x, y, z: 0, visibility };
}

function hand(): VisionHand {
  const landmarks = Array.from({ length: 21 }, () => point(0.5, 0.5));
  return {
    landmarks,
    worldLandmarks: landmarks,
    reportedHandedness: "left",
    handednessScore: 0.9,
  };
}
