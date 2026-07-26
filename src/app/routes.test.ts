import { describe, expect, it } from "vitest";
import { resolveAppRoute } from "./routes";

describe("application route resolution", () => {
  it("resolves the camera laboratory path", () => {
    expect(resolveAppRoute("/lab/camera")).toBe("camera-lab");
  });

  it("falls back to the system baseline for unknown local paths", () => {
    expect(resolveAppRoute("/")).toBe("baseline");
    expect(resolveAppRoute("/unknown")).toBe("baseline");
  });
});
