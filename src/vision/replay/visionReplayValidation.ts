import { isVisionLandmarkFrame } from "../visionWorkerProtocol";
import {
  VISION_REPLAY_SCHEMA_VERSION,
  type VisionReplayFixture,
  type VisionReplayFrame,
  type VisionReplaySource,
} from "./visionReplayTypes";

const REPLAY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedSources: ReadonlySet<VisionReplaySource> = new Set([
  "synthetic",
  "practitioner-reference",
  "consented-participant",
]);

export class VisionReplayValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VisionReplayValidationError";
  }
}

export function parseVisionReplayFixture(
  value: unknown,
): VisionReplayFixture {
  if (!isRecord(value)) {
    throw invalid("Replay fixture must be an object.");
  }
  if (value.schemaVersion !== VISION_REPLAY_SCHEMA_VERSION) {
    throw invalid(
      `Unsupported replay schema version: ${String(value.schemaVersion)}.`,
    );
  }
  if (
    typeof value.id !== "string" ||
    !REPLAY_ID_PATTERN.test(value.id)
  ) {
    throw invalid("Replay id must be a lowercase kebab-case identifier.");
  }
  if (
    typeof value.description !== "string" ||
    value.description.trim().length === 0
  ) {
    throw invalid("Replay description must not be empty.");
  }
  if (
    typeof value.source !== "string" ||
    !allowedSources.has(value.source as VisionReplaySource)
  ) {
    throw invalid("Replay source is not recognized.");
  }
  if (value.containsRecordedImagery !== false) {
    throw invalid("Landmark replays must not contain recorded imagery.");
  }
  if (!Array.isArray(value.frames) || value.frames.length === 0) {
    throw invalid("Replay fixture must contain at least one frame.");
  }

  let previousOffset = -1;
  for (const [index, frame] of value.frames.entries()) {
    if (!isVisionReplayFrame(frame, index)) {
      throw invalid(`Replay frame ${index} is malformed.`);
    }
    if (frame.offsetMs <= previousOffset) {
      throw invalid("Replay frame offsets must be strictly increasing.");
    }
    previousOffset = frame.offsetMs;
  }

  return value as unknown as VisionReplayFixture;
}

function isVisionReplayFrame(
  value: unknown,
  frameId: number,
): value is VisionReplayFrame {
  if (
    !isRecord(value) ||
    !isFiniteNumber(value.offsetMs) ||
    value.offsetMs < 0
  ) {
    return false;
  }

  return isVisionLandmarkFrame({
    frameId,
    capturedAtMs: value.offsetMs,
    completedAtMs: value.offsetMs,
    ...(value.pose === undefined ? {} : { pose: value.pose }),
    hands: value.hands,
    timing: { poseMs: 0, handsMs: 0, totalMs: 0 },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function invalid(message: string): VisionReplayValidationError {
  return new VisionReplayValidationError(message);
}
