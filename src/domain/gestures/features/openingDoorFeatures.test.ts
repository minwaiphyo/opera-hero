import { describe, expect, it } from "vitest";
import type {
  ReportedHandedness,
  VisionHand,
  VisionLandmark,
  VisionLandmarkFrame,
} from "../../../vision/visionTypes";
import { extractOpeningDoorFrameFeatures } from "./openingDoorFeatures";

describe("extractOpeningDoorFrameFeatures", () => {
  it("is invariant to image translation and body scale", () => {
    const original = extractOpeningDoorFrameFeatures(frame());
    const transformed = extractOpeningDoorFrameFeatures(
      frame({ scale: 1.6, translateX: -0.2, translateY: 0.15 }),
    );

    expect(original?.leftArm?.elbowFromShoulder.x).toBeCloseTo(
      transformed?.leftArm?.elbowFromShoulder.x ?? 0,
    );
    expect(original?.rightArm?.wristFromShoulder?.y).toBeCloseTo(
      transformed?.rightArm?.wristFromShoulder?.y ?? 0,
    );
    expect(original?.leftHand?.palmCenterFromBody.x).toBeCloseTo(
      transformed?.leftHand?.palmCenterFromBody.x ?? 0,
    );
    expect(original?.rightHand?.openness).toBeCloseTo(
      transformed?.rightHand?.openness ?? 0,
    );
  });

  it("associates hands to pose wrists instead of trusting reported handedness", () => {
    const result = extractOpeningDoorFrameFeatures(
      frame({ swapReportedHandedness: true }),
    );

    expect(result?.leftHand?.palmCenterFromBody.x).toBeLessThan(0);
    expect(result?.rightHand?.palmCenterFromBody.x).toBeGreaterThan(0);
    expect(result?.usableHandCount).toBe(2);
  });

  it("keeps pose-arm features when hand tracking is unavailable", () => {
    const result = extractOpeningDoorFrameFeatures(frame({ includeHands: false }));

    expect(result?.usableArmCount).toBe(2);
    expect(result?.usableHandCount).toBe(0);
    expect(result?.leftHand).toBeNull();
    expect(result?.rightHand).toBeNull();
  });

  it("keeps an elbow path when its pose wrist is obscured", () => {
    const result = extractOpeningDoorFrameFeatures(
      frame({ leftWristVisibility: 0.1 }),
    );

    expect(result?.leftArm?.elbowFromShoulder).not.toBeNull();
    expect(result?.leftArm?.wristFromShoulder).toBeNull();
    expect(result?.leftArm?.elbowAngleRad).toBeNull();
  });

  it("rejects frames without a reliable body scale", () => {
    expect(
      extractOpeningDoorFrameFeatures(frame({ shoulderVisibility: 0.1 })),
    ).toBeNull();
  });
});

interface FrameOptions {
  scale?: number;
  translateX?: number;
  translateY?: number;
  shoulderVisibility?: number;
  leftWristVisibility?: number;
  includeHands?: boolean;
  swapReportedHandedness?: boolean;
}

function frame(options: FrameOptions = {}): VisionLandmarkFrame {
  const transform = (
    x: number,
    y: number,
    visibility = 0.95,
  ): VisionLandmark => ({
    x: x * (options.scale ?? 1) + (options.translateX ?? 0),
    y: y * (options.scale ?? 1) + (options.translateY ?? 0),
    z: 0,
    visibility,
  });
  const landmarks = Array.from({ length: 33 }, () => transform(0, 0));
  landmarks[11] = transform(0.4, 0.3, options.shoulderVisibility);
  landmarks[12] = transform(0.6, 0.3, options.shoulderVisibility);
  landmarks[13] = transform(0.32, 0.45);
  landmarks[14] = transform(0.68, 0.45);
  landmarks[15] = transform(0.28, 0.55, options.leftWristVisibility);
  landmarks[16] = transform(0.72, 0.55);
  const hands = options.includeHands === false
    ? []
    : [
        hand(transform, 0.28, 0.55, options.swapReportedHandedness ? "right" : "left"),
        hand(transform, 0.72, 0.55, options.swapReportedHandedness ? "left" : "right"),
      ];

  return {
    frameId: 1,
    capturedAtMs: 100,
    completedAtMs: 110,
    pose: { landmarks, worldLandmarks: landmarks },
    hands,
    timing: { poseMs: 5, handsMs: 5, totalMs: 10 },
  };
}

function hand(
  transform: (x: number, y: number, visibility?: number) => VisionLandmark,
  wristX: number,
  wristY: number,
  reportedHandedness: ReportedHandedness,
): VisionHand {
  const landmarks = Array.from({ length: 21 }, (_, index) => {
    const column = (index % 4) - 1.5;
    const row = Math.floor(index / 4);
    return transform(wristX + column * 0.006, wristY - row * 0.012);
  });
  landmarks[0] = transform(wristX, wristY);
  landmarks[5] = transform(wristX - 0.018, wristY - 0.025);
  landmarks[9] = transform(wristX, wristY - 0.035);
  landmarks[13] = transform(wristX + 0.01, wristY - 0.03);
  landmarks[17] = transform(wristX + 0.02, wristY - 0.02);
  landmarks[4] = transform(wristX - 0.03, wristY - 0.05);
  landmarks[8] = transform(wristX - 0.02, wristY - 0.08);
  landmarks[12] = transform(wristX, wristY - 0.09);
  landmarks[16] = transform(wristX + 0.02, wristY - 0.08);
  landmarks[20] = transform(wristX + 0.04, wristY - 0.06);
  return {
    landmarks,
    worldLandmarks: landmarks,
    reportedHandedness,
    handednessScore: 0.95,
  };
}
