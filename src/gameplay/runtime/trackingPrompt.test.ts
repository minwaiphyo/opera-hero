import { describe, expect, it } from "vitest";
import type { VisionTrackingAssessment } from "../../vision/visionQuality";
import { isPresent, trackingPromptFor } from "./trackingPrompt";

function assessment(
  overrides: Partial<VisionTrackingAssessment> = {},
): VisionTrackingAssessment {
  return {
    presence: true,
    framing: "good",
    score: 0.9,
    band: "good",
    poseVisibility: 0.95,
    inFrameCoverage: 1,
    handsDetected: 2,
    upperBodyScale: 0.45,
    ...overrides,
  };
}

describe("tracking prompts", () => {
  it("stays quiet when the visitor is well framed", () => {
    expect(trackingPromptFor({ assessment: assessment(), ageMs: 100 })).toBe("ready");
    expect(isPresent({ assessment: assessment(), ageMs: 100 })).toBe(true);
  });

  it("asks the visitor to step in when nobody is detected", () => {
    expect(
      trackingPromptFor({
        assessment: assessment({ presence: false, framing: "absent" }),
        ageMs: 50,
      }),
    ).toBe("step-into-frame");
    expect(trackingPromptFor({ assessment: null, ageMs: 0 })).toBe("step-into-frame");
  });

  it("treats a stale frame as nobody in view", () => {
    expect(trackingPromptFor({ assessment: assessment(), ageMs: 5_000 })).toBe(
      "step-into-frame",
    );
    expect(isPresent({ assessment: assessment(), ageMs: 5_000 })).toBe(false);
  });

  it("guides distance from the framing classification", () => {
    expect(
      trackingPromptFor({ assessment: assessment({ framing: "too-far" }), ageMs: 0 }),
    ).toBe("move-closer");
    expect(
      trackingPromptFor({ assessment: assessment({ framing: "too-close" }), ageMs: 0 }),
    ).toBe("move-farther");
  });

  it("reports limited tracking while still counting the visitor as present", () => {
    const poor = { assessment: assessment({ band: "poor" as const }), ageMs: 0 };
    expect(trackingPromptFor(poor)).toBe("tracking-limited");
    expect(isPresent(poor)).toBe(true);
  });
});
