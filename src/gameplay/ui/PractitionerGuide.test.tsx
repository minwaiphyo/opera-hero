import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GESTURE_IDS } from "../contract";
import { PractitionerGuide } from "./PractitionerGuide";

afterEach(cleanup);

/**
 * jsdom implements neither playback nor media loading, so the element's play/pause are
 * stubbed and `error` is fired by hand. What is under test is the component's contract
 * with the runtime — one file per gesture, restart per attempt, no dead frame when the
 * local videos have not been built — not the browser's video pipeline.
 */
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() =>
    Promise.resolve(),
  );
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
});

function guide(): HTMLVideoElement {
  return screen.getByLabelText(/demonstration$/) as HTMLVideoElement;
}

describe("practitioner guide", () => {
  it("plays the video that belongs to each gesture", () => {
    for (const gestureId of GESTURE_IDS) {
      cleanup();
      render(<PractitionerGuide gestureId={gestureId} playing restartKey="a" />);

      expect(guide()).toHaveAttribute("src", `/guides/${gestureId}.mp4`);
      expect(guide()).toHaveAttribute("poster", `/guides/${gestureId}.jpg`);
      expect(guide().loop).toBe(true);
      // Autoplay in an unmanned booth is only permitted while muted.
      expect(guide().muted).toBe(true);
    }
  });

  it("returns to the top of the movement for each attempt", () => {
    const { rerender } = render(
      <PractitionerGuide gestureId="orchid-finger" playing restartKey="attempt-1" />,
    );
    guide().currentTime = 6;

    rerender(
      <PractitionerGuide gestureId="orchid-finger" playing restartKey="attempt-2" />,
    );

    expect(guide().currentTime).toBe(0);
  });

  it("leaves playback alone while the attempt key is unchanged", () => {
    const { rerender } = render(
      <PractitionerGuide gestureId="orchid-finger" playing restartKey="attempt-1" />,
    );
    guide().currentTime = 6;

    rerender(
      <PractitionerGuide
        gestureId="orchid-finger"
        playing
        restartKey="attempt-1"
        size="compact"
      />,
    );

    expect(guide().currentTime).toBe(6);
  });

  it("follows the playing flag", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
    const { rerender } = render(
      <PractitionerGuide gestureId="opening-door" playing restartKey="a" />,
    );
    expect(play).toHaveBeenCalled();

    rerender(
      <PractitionerGuide gestureId="opening-door" playing={false} restartKey="a" />,
    );
    expect(pause).toHaveBeenCalled();
  });

  it("survives a play() rejection without reaching the visitor", () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(
      new Error("NotAllowedError"),
    );

    expect(() =>
      render(<PractitionerGuide gestureId="water-sleeves" playing restartKey="a" />),
    ).not.toThrow();
  });

  it("falls back to the framed glyph when the video is missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<PractitionerGuide gestureId="water-sleeves" playing restartKey="a" />);

    fireEvent.error(guide());

    expect(screen.queryByLabelText(/demonstration$/)).toBeNull();
    expect(screen.getByText("Demonstration unavailable")).toBeInTheDocument();
    // The caption still names the movement, so the frame reads as staging, not breakage.
    expect(screen.getByText("Water Sleeves")).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("build_practitioner_guides"));
  });

  it("gives the next gesture its own chance to load", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = render(
      <PractitionerGuide gestureId="water-sleeves" playing restartKey="a" />,
    );
    fireEvent.error(guide());

    rerender(<PractitionerGuide gestureId="orchid-finger" playing restartKey="b" />);

    expect(guide()).toHaveAttribute("src", "/guides/orchid-finger.mp4");
  });
});
