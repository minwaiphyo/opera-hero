import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

/**
 * Both the WASM runtime and the model are vendored under `public/` so the
 * exhibition machine never depends on a CDN reaching the network.
 */
const WASM_BASE_PATH = "/mediapipe/wasm";
const MODEL_ASSET_PATH = "/models/pose_landmarker_lite.task";

/**
 * Creates a single-pose landmarker in VIDEO running mode.
 *
 * Callers own the returned instance and must `close()` it when the video
 * source goes away, otherwise the WASM heap for that graph is never released.
 */
export async function createPoseDetector(): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE_PATH);

  try {
    return await createLandmarker(vision, "GPU");
  } catch {
    // Kiosk hardware without a usable WebGL context still tracks on CPU,
    // just at a lower frame rate.
    return await createLandmarker(vision, "CPU");
  }
}

async function createLandmarker(
  vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  delegate: "CPU" | "GPU",
): Promise<PoseLandmarker> {
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_ASSET_PATH,
      delegate,
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });
}
