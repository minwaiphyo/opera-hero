import { describe, expect, it, vi } from "vitest";
import {
  LatestFrameScheduler,
  type SchedulableVisionFrame,
} from "./latestFrameScheduler";

const createFrame = (
  frameId: number,
): SchedulableVisionFrame & { bitmap: ImageBitmap } => ({
  frameId,
  capturedAtMs: frameId * 10,
  bitmap: {
    close: vi.fn(),
  } as unknown as ImageBitmap,
});

describe("LatestFrameScheduler", () => {
  it("sends the first frame immediately and transfers its bitmap", () => {
    const sendFrame = vi.fn();
    const scheduler = new LatestFrameScheduler(sendFrame);
    const frame = createFrame(1);

    scheduler.submit(frame);

    expect(sendFrame).toHaveBeenCalledWith(
      expect.objectContaining({ type: "process-frame", frameId: 1 }),
      [frame.bitmap],
    );
    expect(scheduler.getStats()).toEqual({
      submitted: 1,
      sent: 1,
      replaced: 0,
      rejected: 0,
      inFlight: true,
      pending: false,
    });
  });

  it("retains only the newest pending frame", () => {
    const sendFrame = vi.fn();
    const scheduler = new LatestFrameScheduler(sendFrame);
    const first = createFrame(1);
    const superseded = createFrame(2);
    const newest = createFrame(3);

    scheduler.submit(first);
    scheduler.submit(superseded);
    scheduler.submit(newest);

    expect(superseded.bitmap.close).toHaveBeenCalledOnce();
    expect(newest.bitmap.close).not.toHaveBeenCalled();
    expect(sendFrame).toHaveBeenCalledTimes(1);
    expect(scheduler.getStats()).toMatchObject({
      submitted: 3,
      sent: 1,
      replaced: 1,
      inFlight: true,
      pending: true,
    });
  });

  it("dispatches the newest pending frame after completion", () => {
    const sendFrame = vi.fn();
    const scheduler = new LatestFrameScheduler(sendFrame);
    const first = createFrame(1);
    const newest = createFrame(2);

    scheduler.submit(first);
    scheduler.submit(newest);

    expect(scheduler.complete(1)).toBe(true);
    expect(sendFrame).toHaveBeenCalledTimes(2);
    expect(sendFrame).toHaveBeenLastCalledWith(
      expect.objectContaining({ frameId: 2 }),
      [newest.bitmap],
    );
    expect(scheduler.getStats()).toMatchObject({
      sent: 2,
      inFlight: true,
      pending: false,
    });
  });

  it("ignores completion for a frame that is not in flight", () => {
    const sendFrame = vi.fn();
    const scheduler = new LatestFrameScheduler(sendFrame);

    scheduler.submit(createFrame(1));
    scheduler.submit(createFrame(2));

    expect(scheduler.complete(99)).toBe(false);
    expect(sendFrame).toHaveBeenCalledTimes(1);
    expect(scheduler.getStats()).toMatchObject({
      inFlight: true,
      pending: true,
    });
  });

  it("closes a pending frame when disposed", () => {
    const scheduler = new LatestFrameScheduler(vi.fn());
    const pending = createFrame(2);

    scheduler.submit(createFrame(1));
    scheduler.submit(pending);
    scheduler.dispose();

    expect(pending.bitmap.close).toHaveBeenCalledOnce();
    expect(scheduler.getStats()).toMatchObject({
      rejected: 1,
      pending: false,
    });
  });

  it("closes and rejects frames submitted after disposal", () => {
    const sendFrame = vi.fn();
    const scheduler = new LatestFrameScheduler(sendFrame);
    const rejected = createFrame(1);

    scheduler.dispose();
    scheduler.submit(rejected);

    expect(rejected.bitmap.close).toHaveBeenCalledOnce();
    expect(sendFrame).not.toHaveBeenCalled();
    expect(scheduler.getStats()).toMatchObject({
      submitted: 1,
      sent: 0,
      rejected: 1,
      inFlight: false,
      pending: false,
    });
  });
});
