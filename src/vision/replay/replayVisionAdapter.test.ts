import { describe, expect, it, vi } from "vitest";
import type { ReplayClock, ReplayTimerHandle } from "./replayClock";
import { ReplayVisionAdapter } from "./replayVisionAdapter";

class FakeReplayClock implements ReplayClock {
  private timeMs = 0;
  private nextHandle = 1;
  private tasks = new Map<
    number,
    { dueAtMs: number; callback: () => void }
  >();

  now(): number {
    return this.timeMs;
  }

  setTimer(callback: () => void, delayMs: number): ReplayTimerHandle {
    const handle = this.nextHandle++;
    this.tasks.set(handle, {
      dueAtMs: this.timeMs + Math.max(0, delayMs),
      callback,
    });
    return handle as ReplayTimerHandle;
  }

  clearTimer(handle: ReplayTimerHandle): void {
    this.tasks.delete(handle as number);
  }

  advanceBy(durationMs: number): void {
    const target = this.timeMs + durationMs;
    while (true) {
      const next = [...this.tasks.entries()]
        .filter(([, task]) => task.dueAtMs <= target)
        .sort(
          ([leftId, left], [rightId, right]) =>
            left.dueAtMs - right.dueAtMs || leftId - rightId,
        )[0];
      if (!next) {
        break;
      }
      const [handle, task] = next;
      this.tasks.delete(handle);
      this.timeMs = task.dueAtMs;
      task.callback();
    }
    this.timeMs = target;
  }
}

const fixture = {
  schemaVersion: 1,
  id: "three-empty-frames",
  description: "Synthetic timing fixture.",
  source: "synthetic",
  containsRecordedImagery: false,
  frames: [
    { offsetMs: 0, hands: [] },
    { offsetMs: 100, hands: [] },
    { offsetMs: 250, hands: [] },
  ],
};

describe("ReplayVisionAdapter", () => {
  it("emits exact normalized frames at deterministic offsets", () => {
    const clock = new FakeReplayClock();
    const adapter = new ReplayVisionAdapter(fixture, clock);
    const frames = vi.fn();
    adapter.subscribeFrames(frames);

    adapter.start();
    clock.advanceBy(0);
    expect(frames).toHaveBeenCalledTimes(1);
    expect(frames).toHaveBeenLastCalledWith(
      expect.objectContaining({ frameId: 0, capturedAtMs: 0, hands: [] }),
    );

    clock.advanceBy(99);
    expect(frames).toHaveBeenCalledTimes(1);
    clock.advanceBy(1);
    expect(frames).toHaveBeenCalledTimes(2);
    clock.advanceBy(150);

    expect(frames).toHaveBeenCalledTimes(3);
    expect(adapter.getSnapshot()).toMatchObject({
      status: "completed",
      positionMs: 250,
      emittedFrames: 3,
    });
  });

  it("pauses and resumes from its logical position", () => {
    const clock = new FakeReplayClock();
    const adapter = new ReplayVisionAdapter(fixture, clock);
    const frames = vi.fn();
    adapter.subscribeFrames(frames);

    adapter.start();
    clock.advanceBy(0);
    clock.advanceBy(40);
    adapter.pause();
    expect(adapter.getSnapshot()).toMatchObject({
      status: "paused",
      positionMs: 40,
    });

    clock.advanceBy(500);
    expect(frames).toHaveBeenCalledTimes(1);
    adapter.start();
    clock.advanceBy(59);
    expect(frames).toHaveBeenCalledTimes(1);
    clock.advanceBy(1);
    expect(frames).toHaveBeenCalledTimes(2);
  });

  it("reschedules remaining frames when playback speed changes", () => {
    const clock = new FakeReplayClock();
    const adapter = new ReplayVisionAdapter(fixture, clock);
    const frames = vi.fn();
    adapter.subscribeFrames(frames);

    adapter.start();
    clock.advanceBy(0);
    adapter.setPlaybackRate(2);
    clock.advanceBy(49);
    expect(frames).toHaveBeenCalledTimes(1);
    clock.advanceBy(1);
    expect(frames).toHaveBeenCalledTimes(2);
    expect(adapter.getSnapshot().playbackRate).toBe(2);
  });

  it("restarts from frame zero and resets its emitted count", () => {
    const clock = new FakeReplayClock();
    const adapter = new ReplayVisionAdapter(fixture, clock);
    const frames = vi.fn();
    adapter.subscribeFrames(frames);
    adapter.start();
    clock.advanceBy(100);
    expect(frames).toHaveBeenCalledTimes(2);

    adapter.restart();
    expect(adapter.getSnapshot()).toMatchObject({
      status: "running",
      positionMs: 0,
      emittedFrames: 0,
    });
    clock.advanceBy(0);
    expect(frames).toHaveBeenCalledTimes(3);
    expect(frames).toHaveBeenLastCalledWith(
      expect.objectContaining({ frameId: 0 }),
    );
  });

  it("stops, disposes, and rejects invalid speeds", () => {
    const clock = new FakeReplayClock();
    const adapter = new ReplayVisionAdapter(fixture, clock);
    const frames = vi.fn();
    adapter.subscribeFrames(frames);
    adapter.start();
    clock.advanceBy(0);

    expect(() => adapter.setPlaybackRate(0)).toThrow(RangeError);
    adapter.stop();
    expect(adapter.getSnapshot()).toMatchObject({
      status: "idle",
      positionMs: 0,
      emittedFrames: 0,
    });
    clock.advanceBy(500);
    expect(frames).toHaveBeenCalledTimes(1);

    adapter.dispose();
    expect(adapter.getSnapshot().status).toBe("disposed");
    expect(() => adapter.start()).toThrow("Replay adapter has been disposed.");
  });
});
