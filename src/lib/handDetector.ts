import { HandLandmarker } from "@mediapipe/tasks-vision";
import { resolveVisionFileset, type VisionFileset } from "./visionFileset";

const MODEL_ASSET_PATH = "/models/hand_landmarker.task";

/**
 * Creates a two-hand landmarker in VIDEO running mode.
 *
 * The pose landmarker only reports a wrist and two knuckles per hand, which
 * cannot tell an orchid finger from a fist. This adds the 21 points per hand
 * that Cantonese Opera gestures are actually defined by.
 *
 * Callers own the returned instance and must `close()` it when the video
 * source goes away, otherwise the WASM heap for that graph is never released.
 */
export async function createHandDetector(): Promise<HandLandmarker> {
  const vision = await resolveVisionFileset();

  try {
    return await createLandmarker(vision, "GPU");
  } catch {
    // Matches the pose detector's fallback: degraded frame rate beats no
    // tracking at all on hardware without a usable WebGL context.
    return await createLandmarker(vision, "CPU");
  }
}

async function createLandmarker(
  vision: VisionFileset,
  delegate: "CPU" | "GPU",
): Promise<HandLandmarker> {
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_ASSET_PATH,
      delegate,
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}
