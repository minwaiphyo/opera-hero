import { describe, expect, it } from "vitest";
import type {
  ReportedHandedness,
  VisionHand,
  VisionLandmark,
  VisionLandmarkFrame,
} from "../../../vision/visionTypes";
import { extractOrchidFingerFrameFeatures } from "./orchidFingerFeatures";

describe("extractOrchidFingerFrameFeatures", () => {
  it("is invariant to image translation and body scale", () => {
    const original = extractOrchidFingerFrameFeatures(frame());
    const transformed = extractOrchidFingerFrameFeatures(
      frame({ scale: 1.7, translateX: -0.2, translateY: 0.1 }),
    );

    expect(original?.leftHand?.palmCenterFromBody.x).toBeCloseTo(
      transformed?.leftHand?.palmCenterFromBody.x ?? 0,
    );
    expect(original?.leftHand?.fingerExtension.index).toBeCloseTo(
      transformed?.leftHand?.fingerExtension.index ?? 0,
    );
    expect(original?.leftHand?.thumbToFingertip.ring).toBeCloseTo(
      transformed?.leftHand?.thumbToFingertip.ring ?? 0,
    );
  });

  it("captures the orchid hand's extended fingers and thumb contact relationship", () => {
    const result = extractOrchidFingerFrameFeatures(frame());
    const hand = result?.leftHand;

    expect(hand?.fingerExtension.index).toBeGreaterThan(hand?.fingerExtension.ring ?? 99);
    expect(hand?.fingerExtension.middle).toBeGreaterThan(hand?.fingerExtension.pinky ?? 99);
    expect(hand?.thumbToFingertip.ring).toBeLessThan(hand?.thumbToFingertip.index ?? 0);
    expect(hand?.fingerCurlRad.index).toBeGreaterThan(hand?.fingerCurlRad.ring ?? 99);
  });

  it("associates hands by pose-wrist proximity despite swapped handedness labels", () => {
    const result = extractOrchidFingerFrameFeatures(
      frame({ swapReportedHandedness: true }),
    );

    expect(result?.leftHand?.palmCenterFromBody.x).toBeLessThan(0);
    expect(result?.rightHand?.palmCenterFromBody.x).toBeGreaterThan(0);
  });

  it("retains arm placement when hand tracking is unavailable", () => {
    const result = extractOrchidFingerFrameFeatures(frame({ includeHands: false }));

    expect(result?.usableArmCount).toBe(2);
    expect(result?.usableHandCount).toBe(0);
    expect(result?.leftArm).not.toBeNull();
  });

  it("rejects frames without a reliable shoulder scale", () => {
    expect(
      extractOrchidFingerFrameFeatures(frame({ shoulderVisibility: 0.1 })),
    ).toBeNull();
  });
});

interface FrameOptions {
  scale?: number;
  translateX?: number;
  translateY?: number;
  shoulderVisibility?: number;
  includeHands?: boolean;
  swapReportedHandedness?: boolean;
}

function frame(options: FrameOptions = {}): VisionLandmarkFrame {
  const transform = (x: number, y: number, visibility = 0.95): VisionLandmark => ({
    x: x * (options.scale ?? 1) + (options.translateX ?? 0),
    y: y * (options.scale ?? 1) + (options.translateY ?? 0),
    z: 0,
    visibility,
  });
  const landmarks = Array.from({ length: 33 }, () => transform(0, 0));
  landmarks[11] = transform(0.4, 0.3, options.shoulderVisibility);
  landmarks[12] = transform(0.6, 0.3, options.shoulderVisibility);
  landmarks[13] = transform(0.34, 0.43);
  landmarks[14] = transform(0.66, 0.43);
  landmarks[15] = transform(0.28, 0.5);
  landmarks[16] = transform(0.72, 0.5);
  const hands = options.includeHands === false ? [] : [
    orchidHand(transform, 0.28, 0.5, options.swapReportedHandedness ? "right" : "left"),
    orchidHand(transform, 0.72, 0.5, options.swapReportedHandedness ? "left" : "right"),
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

function orchidHand(
  transform: (x: number, y: number, visibility?: number) => VisionLandmark,
  wristX: number,
  wristY: number,
  reportedHandedness: ReportedHandedness,
): VisionHand {
  const landmarks = Array.from({ length: 21 }, () => transform(wristX, wristY));
  const set = (index: number, x: number, y: number) => {
    landmarks[index] = transform(wristX + x, wristY + y);
  };
  set(0, 0, 0);
  set(2, -0.02, -0.02); set(3, -0.025, -0.04); set(4, 0.015, -0.055);
  set(5, -0.025, -0.04); set(6, -0.035, -0.075); set(7, -0.04, -0.11); set(8, -0.045, -0.15);
  set(9, 0, -0.05); set(10, 0, -0.09); set(11, 0, -0.13); set(12, 0, -0.17);
  set(13, 0.025, -0.04); set(14, 0.035, -0.065); set(15, 0.025, -0.075); set(16, 0.018, -0.06);
  set(17, 0.045, -0.03); set(18, 0.055, -0.05); set(19, 0.05, -0.06); set(20, 0.04, -0.045);
  return {
    landmarks,
    worldLandmarks: landmarks,
    reportedHandedness,
    handednessScore: 0.95,
  };
}
