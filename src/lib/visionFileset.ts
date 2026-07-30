import { FilesetResolver } from "@mediapipe/tasks-vision";

export type VisionFileset = Awaited<
  ReturnType<typeof FilesetResolver.forVisionTasks>
>;

/**
 * The WASM runtime is vendored under `public/` so the exhibition machine
 * never depends on a CDN reaching the network.
 */
const WASM_BASE_PATH = "/mediapipe/wasm";

let pending: Promise<VisionFileset> | null = null;

/**
 * Resolves the shared vision fileset once per page load.
 *
 * The pose and hand landmarkers each build their own graph, but they read the
 * same runtime, so resolving it per detector would duplicate the work for no
 * benefit. The promise is cached rather than the value so that concurrent
 * callers await a single resolution instead of racing.
 */
export function resolveVisionFileset(): Promise<VisionFileset> {
  pending ??= FilesetResolver.forVisionTasks(WASM_BASE_PATH).catch((error) => {
    // Let the next caller retry instead of caching a rejected promise.
    pending = null;
    throw error;
  });
  return pending;
}
