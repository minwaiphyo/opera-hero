import { describe, expect, it, vi } from "vitest";
import { CameraDeviceCatalog } from "./cameraDeviceCatalog";
import { CameraPreferenceStore } from "./cameraPreferences";
import type { MediaDevicesPort } from "./mediaDevicesPort";

function mediaDevice(
  kind: MediaDeviceKind,
  deviceId: string,
  label: string,
  groupId = "",
): MediaDeviceInfo {
  return { kind, deviceId, label, groupId } as MediaDeviceInfo;
}

function createPort(devices: MediaDeviceInfo[]): MediaDevicesPort & {
  emitDeviceChange: () => void;
  unsubscribe: ReturnType<typeof vi.fn>;
} {
  let deviceChangeListener: (() => void) | undefined;
  const unsubscribe = vi.fn();

  return {
    requestStream: vi.fn(),
    listDevices: vi.fn().mockResolvedValue(devices),
    subscribeToDeviceChanges: vi.fn((listener: () => void) => {
      deviceChangeListener = listener;
      return unsubscribe;
    }),
    emitDeviceChange: () => deviceChangeListener?.(),
    unsubscribe,
  };
}

function createPreferences(preferredDeviceId?: string) {
  const values = new Map<string, string>();
  if (preferredDeviceId) {
    values.set(
      "opera-hero.camera-preferences",
      JSON.stringify({ version: 1, preferredDeviceId }),
    );
  }

  return {
    store: new CameraPreferenceStore({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => {
        values.delete(key);
      },
    }),
    values,
  };
}

describe("CameraDeviceCatalog", () => {
  it("returns only cameras and supplies labels hidden before permission", async () => {
    const port = createPort([
      mediaDevice("audioinput", "mic", "Microphone"),
      mediaDevice("videoinput", "integrated", "", "group-a"),
      mediaDevice("videoinput", "external", "USB Camera"),
    ]);
    const { store } = createPreferences();
    const catalog = new CameraDeviceCatalog(port, store);

    await expect(catalog.listCameras()).resolves.toEqual([
      {
        deviceId: "integrated",
        groupId: "group-a",
        label: "Camera 1",
      },
      {
        deviceId: "external",
        label: "USB Camera",
      },
    ]);
  });

  it("resolves and preserves an available preferred camera", async () => {
    const port = createPort([
      mediaDevice("videoinput", "integrated", "Integrated"),
      mediaDevice("videoinput", "external", "USB"),
    ]);
    const { store, values } = createPreferences("external");
    const catalog = new CameraDeviceCatalog(port, store);

    await expect(catalog.resolveSelection()).resolves.toMatchObject({
      device: { deviceId: "external" },
      reason: "preferred",
    });
    expect(values.size).toBe(1);
  });

  it("clears a stale preference and falls back to the first camera", async () => {
    const port = createPort([
      mediaDevice("videoinput", "integrated", "Integrated"),
    ]);
    const { store, values } = createPreferences("removed");
    const catalog = new CameraDeviceCatalog(port, store);

    await expect(catalog.resolveSelection()).resolves.toMatchObject({
      device: { deviceId: "integrated" },
      reason: "fallback",
      stalePreferredDeviceId: "removed",
    });
    expect(values.size).toBe(0);
  });

  it("saves only a device that currently exists", async () => {
    const port = createPort([
      mediaDevice("videoinput", "external", "USB"),
    ]);
    const { store, values } = createPreferences();
    const catalog = new CameraDeviceCatalog(port, store);

    await expect(catalog.setPreferredDevice("missing")).resolves.toBeNull();
    expect(values.size).toBe(0);

    await expect(
      catalog.setPreferredDevice("external"),
    ).resolves.toMatchObject({ deviceId: "external" });
    expect(values.get("opera-hero.camera-preferences")).toContain("external");
  });

  it("publishes refreshed devices and stops after unsubscribe", async () => {
    const port = createPort([
      mediaDevice("videoinput", "external", "USB"),
    ]);
    const { store } = createPreferences();
    const catalog = new CameraDeviceCatalog(port, store);
    const listener = vi.fn();
    const unsubscribe = catalog.subscribe(listener);

    port.emitDeviceChange();
    await vi.waitFor(() => expect(listener).toHaveBeenCalledOnce());

    unsubscribe();
    port.emitDeviceChange();
    await Promise.resolve();
    expect(listener).toHaveBeenCalledOnce();
    expect(port.unsubscribe).toHaveBeenCalledOnce();
  });

  it("contains transient enumeration failures", async () => {
    const port = createPort([]);
    vi.mocked(port.listDevices).mockRejectedValueOnce(
      new DOMException("busy", "NotReadableError"),
    );
    const { store } = createPreferences();
    const catalog = new CameraDeviceCatalog(port, store);
    const listener = vi.fn();

    catalog.subscribe(listener);
    port.emitDeviceChange();
    await Promise.resolve();
    await Promise.resolve();

    expect(listener).not.toHaveBeenCalled();
  });
});
