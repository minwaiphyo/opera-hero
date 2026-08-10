import { describe, expect, it } from "vitest";
import { resolveAppRoute } from "./routes";

describe("application route resolution", () => {
  it("resolves the camera laboratory path", () => {
    expect(resolveAppRoute("/lab/camera")).toBe("camera-lab");
  });

  it("resolves the landmark laboratory path", () => {
    expect(resolveAppRoute("/lab/landmarks")).toBe("landmark-lab");
  });

  it("resolves the system baseline path", () => {
    expect(resolveAppRoute("/baseline")).toBe("baseline");
  });

  it("resolves the visitor game path", () => {
    expect(resolveAppRoute("/game")).toBe("game");
  });

  it("answers the root and unknown paths with the visitor game", () => {
    expect(resolveAppRoute("/")).toBe("game");
    expect(resolveAppRoute("/unknown")).toBe("game");
  });
});
