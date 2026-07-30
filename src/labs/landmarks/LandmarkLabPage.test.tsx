import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandmarkLabPage } from "./LandmarkLabPage";

vi.mock("./LandmarkReplayCanvas", () => ({
  LandmarkReplayCanvas: () => (
    <canvas aria-label="Landmark replay canvas" />
  ),
}));

describe("LandmarkLabPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("provides deterministic replay controls without starting automatically", () => {
    render(
      <StrictMode>
        <LandmarkLabPage />
      </StrictMode>,
    );

    expect(
      screen.getByRole("heading", { name: "Landmark replay laboratory" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Fixture")).toHaveValue(
      "tracking-loss-recovery",
    );
    expect(screen.getByLabelText("Playback speed")).toHaveValue("1");
    expect(screen.getByText("Replay · idle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeDisabled();
    expect(
      screen.getByRole("link", { name: /M1\s*Camera laboratory/ }),
    ).toBeInTheDocument();
  });

  it("starts, pauses, and switches to the empty fixture", () => {
    render(<LandmarkLabPage />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByText("Replay · running")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByText("Replay · paused")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume" })).toBeEnabled();

    fireEvent.change(screen.getByLabelText("Fixture"), {
      target: { value: "empty-zone" },
    });
    expect(screen.getByLabelText("Fixture")).toHaveValue("empty-zone");
    expect(screen.getByText("Replay · idle")).toBeInTheDocument();
    expect(screen.getAllByText("absent")).toHaveLength(2);
  });
});
