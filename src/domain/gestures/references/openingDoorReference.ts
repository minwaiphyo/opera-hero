import document from "./openingDoor.reference.json";
import type { OpeningDoorReferenceEnvelope } from "../scoring/openingDoorEnvelope";

/** Compact, image-free template generated from both approved normal-pace takes. */
export const OPENING_DOOR_REFERENCE = {
  ...document,
  schemaVersion: 1,
  gestureId: "opening-door",
  derivedFromRecordedImagery: true,
  containsRecordedImagery: false,
} satisfies OpeningDoorReferenceEnvelope;
