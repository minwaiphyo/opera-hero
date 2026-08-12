import { describe, expect, it } from "vitest";
import { TRACKING_PROMPTS } from "./contract";
import {
  bandFor,
  GESTURES,
  percent,
  SCORE_BANDS,
  TRACKING_COPY,
  gestureFor,
  gestureForLevel,
} from "./content";

describe("gameplay content", () => {
  it("gives every gesture a name, three steps and a note", () => {
    for (const gesture of GESTURES) {
      expect(gesture.name.length).toBeGreaterThan(0);
      expect(gesture.chinese.length).toBeGreaterThan(0);
      expect(gesture.steps).toHaveLength(3);
      expect(gesture.note.length).toBeGreaterThan(10);
      expect(gestureFor(gesture.id)).toBe(gesture);
      expect(gestureForLevel(gesture.level)).toBe(gesture);
    }
  });

  it("keeps the steps short enough to read while standing", () => {
    for (const gesture of GESTURES) {
      for (const step of gesture.steps) {
        expect(step.length).toBeLessThanOrEqual(46);
      }
    }
  });

  it("provides copy for every tracking prompt", () => {
    for (const prompt of TRACKING_PROMPTS) {
      expect(TRACKING_COPY[prompt].title.length).toBeGreaterThan(0);
      expect(TRACKING_COPY[prompt].body.length).toBeGreaterThan(0);
    }
  });

  it("returns an encouragement band for any value, in range or not", () => {
    expect(bandFor(0.95).label).toBe("Radiant");
    expect(bandFor(0.5).label).toBe("Taking shape");
    expect(bandFor(0).label).toBe("First steps");
    expect(bandFor(-3).label).toBe("First steps");
    expect(bandFor(Number.NaN).label).toBe("First steps");
    expect(bandFor(9).label).toBe("Radiant");
  });

  it("never phrases a band as passing, failing or judging skill", () => {
    const forbidden = /\b(pass|passed|fail|failed|failure|wrong|incorrect|bad)\b/i;
    for (const band of SCORE_BANDS) {
      expect(band.label).not.toMatch(forbidden);
      expect(band.body).not.toMatch(forbidden);
    }
  });

  it("formats ratios as percentages only at the presentation edge", () => {
    expect(percent(0)).toBe("0%");
    expect(percent(0.626)).toBe("63%");
    expect(percent(1)).toBe("100%");
    expect(percent(4)).toBe("100%");
  });
});
