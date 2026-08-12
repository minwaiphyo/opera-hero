import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
    // The laboratory is a development surface reached by URL; it advertises no
    // navigation to the other milestones.
    expect(screen.queryAllByRole("link")).toHaveLength(0);
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

  it("loads and describes a local practitioner fixture", async () => {
    render(<LandmarkLabPage />);
    const fixture = {
      schemaVersion: 1,
      id: "opening-door-slow-pilot",
      description: "Opening Door slow practitioner reference pilot",
      source: "practitioner-reference",
      containsRecordedImagery: false,
      extraction: {
        sourceFile: "OpeningDoorSlowedPace.mp4",
        sourceDurationMs: 8267,
        sampleFps: 20,
        trimmedStartMs: 0,
        trimmedEndMs: 7767,
        motionDetected: true,
        motionThreshold: 0.12,
        motionSustainMs: 250,
        edgePaddingMs: 400,
      },
      frames: [
        { offsetMs: 0, hands: [] },
        { offsetMs: 50, hands: [] },
      ],
    };
    const file = fixtureFile("opening-door.fixture.json", fixture);

    fireEvent.change(screen.getByLabelText("Load local fixture JSON"), {
      target: { files: [file] },
    });

    await waitFor(() =>
      expect(screen.getByText("Loaded opening-door.fixture.json.")).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Fixture")).toHaveValue("local");
    expect(screen.getByText("OpeningDoorSlowedPace.mp4")).toBeInTheDocument();
    expect(screen.getByText("0–7767 ms")).toBeInTheDocument();
    expect(screen.getByText("20 FPS")).toBeInTheDocument();
    expect(screen.getByText("Opening Door slow practitioner reference pilot")).toBeInTheDocument();
  });

  it("reports invalid local fixture JSON without replacing the replay", async () => {
    render(<LandmarkLabPage />);
    const file = new File(["not-json"], "broken.json", {
      type: "application/json",
    });
    Object.defineProperty(file, "text", {
      value: async () => "not-json",
    });

    fireEvent.change(screen.getByLabelText("Load local fixture JSON"), {
      target: { files: [file] },
    });

    await waitFor(() =>
      expect(screen.getByText(/Fixture load failed/)).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Fixture")).toHaveValue(
      "tracking-loss-recovery",
    );
  });
});

function fixtureFile(name: string, value: unknown): File {
  const serialized = JSON.stringify(value);
  const file = new File([serialized], name, { type: "application/json" });
  Object.defineProperty(file, "text", {
    value: async () => serialized,
  });
  return file;
}
