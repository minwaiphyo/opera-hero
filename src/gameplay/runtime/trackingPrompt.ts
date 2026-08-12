/**
 * Turns the vision layer's tracking assessment into visitor-facing guidance.
 *
 * Pure, so it can be tested without a camera. The thresholds live in
 * `src/vision/visionQuality.ts`; this only chooses what the visitor is told.
 */

import type { VisionTrackingAssessment } from "../../vision/visionQuality";
import type { TrackingPrompt } from "../contract";

/** A frame older than this means we cannot currently see anything. */
export const STALE_FRAME_MS = 1_200;

export interface PresenceInput {
  assessment: VisionTrackingAssessment | null;
  ageMs: number;
}

export function trackingPromptFor({ assessment, ageMs }: PresenceInput): TrackingPrompt {
  if (!assessment || ageMs > STALE_FRAME_MS) {
    return "step-into-frame";
  }
  if (!assessment.presence || assessment.framing === "absent") {
    return "step-into-frame";
  }
  if (assessment.framing === "too-far") {
    return "move-closer";
  }
  if (assessment.framing === "too-close") {
    return "move-farther";
  }
  if (assessment.band === "lost" || assessment.band === "poor") {
    return "tracking-limited";
  }
  return "ready";
}

/** Whether somebody is standing in front of the booth right now. */
export function isPresent({ assessment, ageMs }: PresenceInput): boolean {
  return (
    assessment !== null &&
    ageMs <= STALE_FRAME_MS &&
    assessment.presence &&
    assessment.framing !== "absent"
  );
}
