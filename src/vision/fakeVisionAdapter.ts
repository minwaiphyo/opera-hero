import {
  HAND_LANDMARK_COUNT,
  POSE_LANDMARK_COUNT,
} from "./landmarkValidation";
import type {
  Handedness,
  LandmarkFrame,
  NormalizedHand,
  NormalizedLandmark,
  VisionCapabilities,
  VisionFrameInput,
} from "./landmarkTypes";
import type { VisionAdapter } from "./visionAdapter";

export class FakeVisionAdapter implements VisionAdapter {
  #initialized = false;
  #disposed = false;

  async initialize(): Promise<VisionCapabilities> {
    if (this.#disposed) {
      throw new Error("The simulated vision adapter has been disposed.");
    }

    this.#initialized = true;
    return {
      adapter: "Deterministic landmark simulator",
      runtime: "fake",
      model: "simulated",
      poseLandmarkCount: POSE_LANDMARK_COUNT,
      handLandmarkCount: HAND_LANDMARK_COUNT,
      maxHands: 2,
    };
  }

  async process(input: VisionFrameInput): Promise<LandmarkFrame> {
    if (!this.#initialized || this.#disposed) {
      throw new Error("Initialize the simulated vision adapter before processing.");
    }

    const phase = input.timestampMs / 700;
    return {
      frameId: input.frameId,
      timestampMs: input.timestampMs,
      pose: { landmarks: createPose(phase) },
      hands: [
        createHand("left", 0.25, 0.47, phase),
        createHand("right", 0.75, 0.47, -phase),
      ],
      trackingQuality: 0.94,
      framing: "good",
      inferenceDurationMs: 2.4,
    };
  }

  async dispose(): Promise<void> {
    this.#initialized = false;
    this.#disposed = true;
  }
}

export const createFakeVisionAdapter = () => new FakeVisionAdapter();

function createPose(phase: number): NormalizedLandmark[] {
  const points = Array.from({ length: POSE_LANDMARK_COUNT }, () =>
    point(0.5, 0.52),
  );
  const sway = Math.sin(phase) * 0.018;

  points[0] = point(0.5 + sway, 0.18);
  points[7] = point(0.46 + sway, 0.2);
  points[8] = point(0.54 + sway, 0.2);
  points[11] = point(0.39 + sway, 0.34);
  points[12] = point(0.61 + sway, 0.34);
  points[13] = point(0.31 + sway, 0.43);
  points[14] = point(0.69 + sway, 0.43);
  points[15] = point(0.24 + sway, 0.52 + Math.sin(phase) * 0.025);
  points[16] = point(0.76 + sway, 0.52 - Math.sin(phase) * 0.025);
  points[17] = point(0.22 + sway, 0.5);
  points[18] = point(0.78 + sway, 0.5);
  points[19] = point(0.23 + sway, 0.48);
  points[20] = point(0.77 + sway, 0.48);
  points[21] = point(0.25 + sway, 0.49);
  points[22] = point(0.75 + sway, 0.49);
  points[23] = point(0.43 + sway, 0.63);
  points[24] = point(0.57 + sway, 0.63);
  points[25] = point(0.43 + sway, 0.79);
  points[26] = point(0.57 + sway, 0.79);
  points[27] = point(0.43 + sway, 0.93);
  points[28] = point(0.57 + sway, 0.93);
  points[29] = point(0.42 + sway, 0.95);
  points[30] = point(0.58 + sway, 0.95);
  points[31] = point(0.44 + sway, 0.97);
  points[32] = point(0.56 + sway, 0.97);
  return points;
}

function createHand(
  handedness: Handedness,
  centerX: number,
  centerY: number,
  phase: number,
): NormalizedHand {
  const direction = handedness === "left" ? -1 : 1;
  const flutter = Math.sin(phase) * 0.006;
  const landmarks = Array.from({ length: HAND_LANDMARK_COUNT }, (_, index) => {
    if (index === 0) {
      return point(centerX, centerY + 0.07);
    }
    const finger = Math.floor((index - 1) / 4);
    const joint = ((index - 1) % 4) + 1;
    return point(
      centerX + direction * (finger - 2) * 0.012 + flutter,
      centerY + 0.06 - joint * 0.024,
    );
  });

  return {
    handedness,
    score: 0.92,
    landmarks,
  };
}

function point(x: number, y: number): NormalizedLandmark {
  return {
    x,
    y,
    z: 0,
    visibility: 0.96,
    presence: 0.97,
  };
}
