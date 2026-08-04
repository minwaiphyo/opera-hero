import document from "./orchidFinger.reference.json";
import type { OrchidFingerReferenceEnvelope } from "../scoring/orchidFingerEnvelope";

/** Compact, image-free template generated from the three approved normal takes. */
export const ORCHID_FINGER_REFERENCE = {
  ...document,
  schemaVersion: 1,
  gestureId: "orchid-finger",
  derivedFromRecordedImagery: true,
  containsRecordedImagery: false,
} satisfies OrchidFingerReferenceEnvelope;
