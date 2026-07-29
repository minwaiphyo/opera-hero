import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeVisionAdapter } from "../../vision/fakeVisionAdapter";
import { LandmarkLabPage } from "./LandmarkLabPage";

describe("LandmarkLabPage", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: vi.fn(() => ({
        arc: vi.fn(),
        beginPath: vi.fn(),
        clearRect: vi.fn(),
        fill: vi.fn(),
        fillRect: vi.fn(),
        lineTo: vi.fn(),
        moveTo: vi.fn(),
        stroke: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("runs the simulated adapter and reports pose and hand diagnostics", async () => {
    render(<LandmarkLabPage />);

    expect(screen.getByText("Landmark stream is stopped")).toBeInTheDocument();
    expect(
      screen.getByText("No camera or MediaPipe model is active"),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Start simulation" }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Deterministic landmark simulator")).toBeInTheDocument();
      expect(screen.getByText("94%")).toBeInTheDocument();
      expect(screen.getByText("good")).toBeInTheDocument();
    });
    expect(screen.queryByText("Landmark stream is stopped")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Pose overlay")).toBeChecked();
    expect(screen.getByLabelText("Hand overlays")).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(screen.getByText("stopped")).toBeInTheDocument();
  });

  it("disposes the adapter when the page unmounts", async () => {
    const adapter = new FakeVisionAdapter();
    const dispose = vi.spyOn(adapter, "dispose");
    const { unmount } = render(
      <LandmarkLabPage adapterFactory={() => adapter} />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Start simulation" }),
      );
    });
    unmount();

    expect(dispose).toHaveBeenCalledOnce();
  });
});
