import { describe, expect, it } from "vitest";
import {
  collectBrowserBaseline,
  requiredCapabilitiesPass,
  type BrowserBaseline,
} from "./capabilities";

describe("browser capability baseline", () => {
  it("collects a timestamped baseline", () => {
    HTMLCanvasElement.prototype.getContext = () => null;
    const baseline = collectBrowserBaseline();

    expect(baseline.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(baseline.viewport.width).toBeGreaterThan(0);
    expect(baseline.capabilities.map((item) => item.id)).toContain("camera-api");
  });

  it("passes only when every required capability is available", () => {
    const baseline: BrowserBaseline = {
      capturedAt: "2026-07-24T00:00:00.000Z",
      userAgent: "test",
      language: "en",
      online: false,
      viewport: {
        width: 1600,
        height: 1000,
        pixelRatio: 1,
        orientation: "landscape-primary",
      },
      capabilities: [
        {
          id: "required",
          label: "Required",
          state: "available",
          detail: "",
          required: true,
        },
        {
          id: "optional",
          label: "Optional",
          state: "unavailable",
          detail: "",
          required: false,
        },
      ],
    };

    expect(requiredCapabilitiesPass(baseline)).toBe(true);
    baseline.capabilities[0].state = "unavailable";
    expect(requiredCapabilitiesPass(baseline)).toBe(false);
  });
});
