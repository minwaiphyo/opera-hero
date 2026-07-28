export type CameraStabilitySample = {
  capturedAtMs: number;
  totalVideoFrames: number;
  droppedVideoFrames: number;
  usedHeapBytes?: number;
};

export type CameraStabilityMetrics = {
  elapsedMs: number;
  renderedFrames: number;
  droppedFrames: number;
  observedFrameRate: number;
  droppedFrameRate: number;
  stalledSamples: number;
  initialHeapBytes?: number;
  currentHeapBytes?: number;
  peakHeapBytes?: number;
};

export function calculateCameraStability(
  samples: readonly CameraStabilitySample[],
): CameraStabilityMetrics {
  const first = samples[0];
  const last = samples.at(-1);
  if (!first || !last) {
    return EMPTY_CAMERA_STABILITY;
  }

  const elapsedMs = Math.max(0, last.capturedAtMs - first.capturedAtMs);
  const totalFrames = Math.max(
    0,
    last.totalVideoFrames - first.totalVideoFrames,
  );
  const droppedFrames = Math.max(
    0,
    last.droppedVideoFrames - first.droppedVideoFrames,
  );
  const renderedFrames = Math.max(0, totalFrames - droppedFrames);
  const heapSamples = samples.flatMap((sample) =>
    sample.usedHeapBytes === undefined ? [] : [sample.usedHeapBytes],
  );

  return {
    elapsedMs,
    renderedFrames,
    droppedFrames,
    observedFrameRate:
      elapsedMs > 0 ? renderedFrames / (elapsedMs / 1000) : 0,
    droppedFrameRate: totalFrames > 0 ? droppedFrames / totalFrames : 0,
    stalledSamples: countStalledSamples(samples),
    ...(heapSamples.length > 0
      ? {
          initialHeapBytes: heapSamples[0],
          currentHeapBytes: heapSamples.at(-1),
          peakHeapBytes: Math.max(...heapSamples),
        }
      : {}),
  };
}

export const EMPTY_CAMERA_STABILITY: CameraStabilityMetrics = {
  elapsedMs: 0,
  renderedFrames: 0,
  droppedFrames: 0,
  observedFrameRate: 0,
  droppedFrameRate: 0,
  stalledSamples: 0,
};

function countStalledSamples(
  samples: readonly CameraStabilitySample[],
): number {
  let stalls = 0;
  for (let index = 1; index < samples.length; index += 1) {
    const currentRendered =
      samples[index].totalVideoFrames - samples[index].droppedVideoFrames;
    const previousRendered =
      samples[index - 1].totalVideoFrames -
      samples[index - 1].droppedVideoFrames;
    if (currentRendered <= previousRendered) {
      stalls += 1;
    }
  }
  return stalls;
}
