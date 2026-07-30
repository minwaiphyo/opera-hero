import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  type HandLandmarkerResult,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import createMediaPipeModule from "@mediapipe/tasks-vision/vision_wasm_module_internal.js";
import wasmModuleBinaryUrl from "@mediapipe/tasks-vision/vision_wasm_module_internal.wasm?url";
import { normalizeMediaPipeFrame } from "./mediapipeNormalization";
import type {
  VisionDelegate,
  VisionWorkerConfiguration,
  VisionWorkerRequest,
  VisionWorkerResponse,
} from "./visionWorkerProtocol";

type MediaPipeModuleFactory = typeof createMediaPipeModule;
type VisionWorkerScope = DedicatedWorkerGlobalScope & {
  ModuleFactory?: MediaPipeModuleFactory;
};

const workerScope = self as unknown as VisionWorkerScope;

let poseDetector: PoseLandmarker | null = null;
let handDetector: HandLandmarker | null = null;
let configuration: VisionWorkerConfiguration | null = null;
let disposed = false;

workerScope.onmessage = (event: MessageEvent<unknown>) => {
  const request = event.data as Partial<VisionWorkerRequest>;

  if (request.type === "initialize" && "configuration" in request) {
    void initialize(request.configuration as VisionWorkerConfiguration);
    return;
  }
  if (
    request.type === "process-frame" &&
    "bitmap" in request &&
    "frameId" in request &&
    "capturedAtMs" in request
  ) {
    processFrame(request as Extract<
      VisionWorkerRequest,
      { type: "process-frame" }
    >);
    return;
  }
  if (request.type === "dispose") {
    dispose();
    return;
  }

  postError("invalid-message", "The vision worker received an invalid command.");
};

async function initialize(next: VisionWorkerConfiguration): Promise<void> {
  if (disposed) {
    postError("disposed", "The vision worker has already been disposed.");
    return;
  }

  try {
    const vision = await resolveWorkerVisionFileset();
    const delegates: VisionDelegate[] =
      next.preferredDelegate === "GPU" ? ["GPU", "CPU"] : ["CPU"];

    let lastError: unknown;
    for (const delegate of delegates) {
      try {
        const detectors = await createDetectors(next, vision, delegate);
        if (disposed) {
          detectors.pose.close();
          detectors.hand.close();
          return;
        }

        poseDetector = detectors.pose;
        handDetector = detectors.hand;
        configuration = next;
        post({
          type: "ready",
          delegate,
          poseModel: next.poseModel,
          maxHands: next.maxHands,
        });
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  } catch (error) {
    postError(
      "initialization-failed",
      `The landmark models could not be initialized. ${diagnosticMessage(error)}`,
    );
  }
}

async function resolveWorkerVisionFileset(): Promise<
  Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>
> {
  return {
    // MediaPipe clears globalThis.ModuleFactory after each Task is created.
    // Supplying no loader path lets us explicitly restore the imported factory
    // before constructing each detector instead of relying on a cached dynamic
    // import to execute twice.
    wasmLoaderPath: "",
    wasmBinaryPath: wasmModuleBinaryUrl,
  };
}

async function createDetectors(
  next: VisionWorkerConfiguration,
  vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  delegate: VisionDelegate,
): Promise<{ pose: PoseLandmarker; hand: HandLandmarker }> {
  workerScope.ModuleFactory = createMediaPipeModule;
  const pose = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: next.poseModelPath, delegate },
    runningMode: "VIDEO",
    numPoses: 1,
  });

  try {
    workerScope.ModuleFactory = createMediaPipeModule;
    const hand = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: next.handModelPath, delegate },
      runningMode: "VIDEO",
      numHands: next.maxHands,
    });
    return { pose, hand };
  } catch (error) {
    pose.close();
    throw error;
  }
}

function processFrame(
  request: Extract<VisionWorkerRequest, { type: "process-frame" }>,
): void {
  if (disposed || !poseDetector || !handDetector || !configuration) {
    request.bitmap.close();
    postError(
      disposed ? "disposed" : "inference-failed",
      disposed
        ? "The vision worker has already been disposed."
        : "The landmark models are not ready.",
      request.frameId,
    );
    return;
  }

  try {
    const poseStartedAt = performance.now();
    // MediaPipe's graph timestamp must be monotonic but cannot safely carry an
    // epoch-sized millisecond value. Keep it on the worker's local performance
    // timeline and reserve capturedAtMs for cross-thread latency metadata.
    const mediaPipeTimestamp = poseStartedAt;
    const poseResult: PoseLandmarkerResult = poseDetector.detectForVideo(
      request.bitmap,
      mediaPipeTimestamp,
    );
    const poseCompletedAt = performance.now();
    const handResult: HandLandmarkerResult = handDetector.detectForVideo(
      request.bitmap,
      mediaPipeTimestamp,
    );
    const inferenceCompletedAt = performance.now();
    const completedAtMs = performance.timeOrigin + inferenceCompletedAt;

    post({
      type: "result",
      frame: normalizeMediaPipeFrame({
        frameId: request.frameId,
        capturedAtMs: request.capturedAtMs,
        completedAtMs,
        poseResult,
        handResult,
        poseInferenceMs: poseCompletedAt - poseStartedAt,
        handInferenceMs: inferenceCompletedAt - poseCompletedAt,
      }),
    });
  } catch (error) {
    postError(
      "inference-failed",
      `Landmark inference could not complete for this frame. ${diagnosticMessage(error)}`,
      request.frameId,
    );
  } finally {
    request.bitmap.close();
  }
}

function dispose(): void {
  if (disposed) {
    return;
  }
  disposed = true;
  poseDetector?.close();
  handDetector?.close();
  poseDetector = null;
  handDetector = null;
  configuration = null;
  post({ type: "disposed" });
  workerScope.close();
}

function post(response: VisionWorkerResponse): void {
  workerScope.postMessage(response);
}

function postError(
  code: Extract<VisionWorkerResponse, { type: "error" }>["code"],
  message: string,
  frameId?: number,
): void {
  post({
    type: "error",
    code,
    message,
    ...(frameId === undefined ? {} : { frameId }),
  });
}

function diagnosticMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "No additional error detail was provided.";
  return message.replaceAll(/\s+/g, " ").slice(0, 300);
}
