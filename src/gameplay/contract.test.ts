import { describe, expect, it } from "vitest";
import {
  GESTURE_DEFINITIONS,
  GESTURE_IDS as DOMAIN_GESTURE_IDS,
} from "../domain/gestures/scoring/gestureScoringContract";
import { GESTURE_IDS } from "./contract";
import { GESTURES } from "./content";

/**
 * The screens deliberately do not import the scoring domain, so these tests are the guard
 * against the two copies of the gesture list drifting apart.
 */
describe("gameplay contract", () => {
  it("mirrors the scoring domain's gesture identifiers and order", () => {
    expect(GESTURE_IDS).toEqual([...DOMAIN_GESTURE_IDS]);
  });

  it("matches the domain's level ordering", () => {
    expect(GESTURES.map((gesture) => [gesture.id, gesture.level])).toEqual(
      GESTURE_DEFINITIONS.map((definition) => [definition.id, definition.level]),
    );
  });
});
