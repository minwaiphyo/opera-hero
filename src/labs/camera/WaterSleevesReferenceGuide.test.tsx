import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WaterSleevesReferenceGuide } from "./WaterSleevesReferenceGuide";

vi.mock("../landmarks/LandmarkReplayCanvas", () => ({
  LandmarkReplayCanvas: ({ frame }: { frame: { frameId: number } }) => (
    <div data-testid="reference-frame">{frame.frameId}</div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("WaterSleevesReferenceGuide", () => {
  it("loops the compact practitioner guide and supports a manual restart", () => {
    vi.useFakeTimers();
    render(<WaterSleevesReferenceGuide restartToken={null} />);

    expect(screen.getByText("Practitioner reference")).toBeInTheDocument();
    expect(screen.getByTestId("reference-frame")).toHaveTextContent("0");
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByTestId("reference-frame")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "Replay guide" }));
    expect(screen.getByTestId("reference-frame")).toHaveTextContent("0");
  });

  it("holds at the first frame until attempt playback is enabled", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <WaterSleevesReferenceGuide playbackEnabled={false} restartToken="attempt-1" />,
    );

    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByTestId("reference-frame")).toHaveTextContent("0");

    rerender(
      <WaterSleevesReferenceGuide playbackEnabled restartToken="attempt-1" />,
    );
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByTestId("reference-frame")).toHaveTextContent("1");
  });
});
