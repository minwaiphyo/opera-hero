import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrchidFingerReferenceGuide } from "./OrchidFingerReferenceGuide";

vi.mock("../landmarks/LandmarkReplayCanvas", () => ({ LandmarkReplayCanvas: ({ frame }: { frame: { frameId: number; hands: unknown[] } }) => <div data-testid="orchid-reference-frame">{frame.frameId}:{frame.hands.length}</div> }));
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe("OrchidFingerReferenceGuide", () => {
  it("holds during countdown then plays its pose-and-hand guide", () => {
    vi.useFakeTimers(); const { rerender } = render(<OrchidFingerReferenceGuide playbackEnabled={false} restartToken="attempt-1" />);
    act(() => vi.advanceTimersByTime(1000)); expect(screen.getByTestId("orchid-reference-frame")).toHaveTextContent(/^0:/);
    rerender(<OrchidFingerReferenceGuide playbackEnabled restartToken="attempt-1" />); act(() => vi.advanceTimersByTime(400));
    expect(screen.getByTestId("orchid-reference-frame")).toHaveTextContent(/^1:/); expect(screen.getByText("Orchid Finger reference")).toBeInTheDocument();
  });
});
