import document from "./waterSleeves.reference.json";
import type { WaterSleevesReferenceEnvelope } from "../scoring/waterSleevesEnvelope";

/** Compact, image-free template generated from the approved sleeved fixture. */
export const WATER_SLEEVES_REFERENCE = {
  ...document,
  schemaVersion: 1,
  gestureId: "water-sleeves",
  derivedFromRecordedImagery: true,
  containsRecordedImagery: false,
} satisfies WaterSleevesReferenceEnvelope;
