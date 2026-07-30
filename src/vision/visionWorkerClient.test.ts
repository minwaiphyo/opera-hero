import { describe, expect, it, vi } from "vitest";
import type { VisionLandmarkFrame } from "./visionTypes";
import {
  VisionWorkerClient,
  type WorkerPort,
} from "./visionWorkerClient";

class FakeWorker implements WorkerPort {
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  respond(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent<unknown>);
  }
}

const bitmap = () =>
  ({ close: vi.fn() }) as unknown as ImageBitmap;

const emptyFrame = (frameId: number): VisionLandmarkFrame => ({
  frameId,
  capturedAtMs: 10,
  completedAtMs: 20,
  hands: [],
  timing: { poseMs: 3, handsMs: 4, totalMs: 10 },
});

describe("VisionWorkerClient", () => {
  it("initializes and reports worker-confirmed runtime details", () => {
    const worker = new FakeWorker();
    const onStateChange = vi.fn();
    new VisionWorkerClient(worker, { onFrame: vi.fn(), onStateChange });

    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "initialize",
        configuration: expect.objectContaining({
          poseModel: "lite",
          preferredDelegate: "GPU",
        }),
      }),
    );

    worker.respond({
      type: "ready",
      delegate: "CPU",
      poseModel: "lite",
      maxHands: 2,
    });
    expect(onStateChange).toHaveBeenCalledWith({
      status: "tracking",
      delegate: "CPU",
      poseModel: "lite",
    });
  });

  it("releases backpressure before publishing a valid result", () => {
    const worker = new FakeWorker();
    const onFrame = vi.fn();
    const client = new VisionWorkerClient(worker, {
      onFrame,
      onStateChange: vi.fn(),
    });

    client.submit({ frameId: 1, capturedAtMs: 10, bitmap: bitmap() });
    client.submit({ frameId: 2, capturedAtMs: 20, bitmap: bitmap() });
    expect(client.getStats()).toMatchObject({ sent: 1, pending: true });

    worker.respond({ type: "result", frame: emptyFrame(1) });

    expect(onFrame).toHaveBeenCalledWith(emptyFrame(1));
    expect(client.getStats()).toMatchObject({ sent: 2, pending: false });
  });

  it("releases a failed frame and exposes its diagnostic", () => {
    const worker = new FakeWorker();
    const onStateChange = vi.fn();
    const client = new VisionWorkerClient(worker, {
      onFrame: vi.fn(),
      onStateChange,
    });
    client.submit({ frameId: 1, capturedAtMs: 10, bitmap: bitmap() });

    worker.respond({
      type: "error",
      code: "inference-failed",
      frameId: 1,
      message: "Frame failed.",
    });

    expect(client.getStats().inFlight).toBe(false);
    expect(onStateChange).toHaveBeenCalledWith({
      status: "error",
      message: "Frame failed.",
    });
  });

  it("rejects malformed worker messages", () => {
    const worker = new FakeWorker();
    const onStateChange = vi.fn();
    new VisionWorkerClient(worker, { onFrame: vi.fn(), onStateChange });

    worker.respond({ type: "result", frame: { frameId: "bad" } });

    expect(onStateChange).toHaveBeenCalledWith({
      status: "error",
      message: "The vision worker returned an invalid response.",
    });
  });

  it("disposes scheduler and worker ownership once", () => {
    const worker = new FakeWorker();
    const client = new VisionWorkerClient(worker, {
      onFrame: vi.fn(),
      onStateChange: vi.fn(),
    });

    client.dispose();
    client.dispose();

    expect(worker.postMessage).toHaveBeenCalledWith({ type: "dispose" });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
