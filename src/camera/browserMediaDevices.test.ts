import { describe, expect, it, vi } from "vitest";
import { BrowserMediaDevices } from "./browserMediaDevices";

describe("BrowserMediaDevices", () => {
  it("passes constraints to the browser camera API", async () => {
    const stream = {} as MediaStream;
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    const adapter = new BrowserMediaDevices(
      { getUserMedia } as unknown as MediaDevices,
      true,
    );
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: true,
    };

    await expect(adapter.requestStream(constraints)).resolves.toBe(stream);
    expect(getUserMedia).toHaveBeenCalledWith(constraints);
  });

  it("rejects an insecure context before requesting a stream", async () => {
    const getUserMedia = vi.fn();
    const adapter = new BrowserMediaDevices(
      { getUserMedia } as unknown as MediaDevices,
      false,
    );

    await expect(adapter.requestStream({ video: true })).rejects.toMatchObject({
      name: "SecurityError",
    });
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("reports an unavailable browser camera API", async () => {
    const adapter = new BrowserMediaDevices(undefined, true);

    await expect(adapter.requestStream({ video: true })).rejects.toMatchObject({
      name: "NotFoundError",
    });
  });
});
