import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HardwareChecks } from "./HardwareChecks";

const stopTrack = vi.fn();
const mockStream = {
  getTracks: () => [{ stop: stopTrack }],
  getVideoTracks: () => [{ label: "Test Integrated Camera", stop: stopTrack }],
} as unknown as MediaStream;

describe("hardware checks", () => {
  beforeEach(() => {
    stopTrack.mockClear();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts and explicitly stops the camera stream", async () => {
    render(<HardwareChecks />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Test camera" }));
    });

    expect(
      screen.getByText("Live preview active. Confirm the image and camera indicator."),
    ).toBeInTheDocument();
    expect(screen.getByText("Test Integrated Camera")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stop camera" }));

    expect(stopTrack).toHaveBeenCalledOnce();
    expect(
      screen.getByText(
        "Camera stopped. Confirm the camera indicator has switched off.",
      ),
    ).toBeInTheDocument();
  });

  it("stops an active stream when the component unmounts", async () => {
    const { unmount } = render(<HardwareChecks />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Test camera" }));
    });
    unmount();

    expect(stopTrack).toHaveBeenCalledOnce();
  });

  it("shows a clear permission-denied state", async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new DOMException("Denied", "NotAllowedError"),
    );
    render(<HardwareChecks />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Test camera" }));
    });

    expect(
      screen.getByText(
        "Camera permission was denied. Allow it in Chrome site settings and retry.",
      ),
    ).toBeInTheDocument();
  });
});
