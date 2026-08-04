import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OpeningDoorReferenceGuide } from "./OpeningDoorReferenceGuide";

vi.mock("../landmarks/LandmarkReplayCanvas", () => ({
  LandmarkReplayCanvas: ({ frame }: { frame: { frameId: number; hands: unknown[] } }) => (
    <div data-testid="opening-reference-frame">{frame.frameId}:{frame.hands.length}</div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("OpeningDoorReferenceGuide", () => {
  it("holds during countdown then plays the pose-and-hand guide", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <OpeningDoorReferenceGuide playbackEnabled={false} restartToken="attempt-1" />,
    );
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId("opening-reference-frame")).toHaveTextContent(/^0:/);

    rerender(<OpeningDoorReferenceGuide playbackEnabled restartToken="attempt-1" />);
    act(() => vi.advanceTimersByTime(220));
    expect(screen.getByTestId("opening-reference-frame")).toHaveTextContent(/^1:/);
    expect(screen.getByText("Opening Door reference")).toBeInTheDocument();
  });
});
