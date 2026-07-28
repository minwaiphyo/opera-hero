import { describe, expect, it, vi } from "vitest";
import {
  CameraPreferenceStore,
  type KeyValueStorage,
} from "./cameraPreferences";

function createStorage(initial?: string): KeyValueStorage & {
  removeItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
} {
  let value = initial ?? null;

  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => {
      value = next;
    }),
    removeItem: vi.fn(() => {
      value = null;
    }),
  };
}

describe("CameraPreferenceStore", () => {
  it("saves and loads a versioned preferred device", () => {
    const storage = createStorage();
    const preferences = new CameraPreferenceStore(storage);

    preferences.savePreferredDevice(" usb-camera ");

    expect(preferences.load()).toEqual({
      preferredDeviceId: "usb-camera",
    });
    expect(storage.setItem).toHaveBeenCalledWith(
      "opera-hero.camera-preferences",
      JSON.stringify({ version: 1, preferredDeviceId: "usb-camera" }),
    );
  });

  it.each([
    "not json",
    JSON.stringify({ version: 2, preferredDeviceId: "old" }),
    JSON.stringify({ version: 1, preferredDeviceId: "" }),
    JSON.stringify(["unexpected"]),
  ])("rejects invalid stored data: %s", (stored) => {
    const storage = createStorage(stored);
    const preferences = new CameraPreferenceStore(storage);

    expect(preferences.load()).toEqual({});
    expect(storage.removeItem).toHaveBeenCalled();
  });

  it("clears the preference when saving an empty ID", () => {
    const storage = createStorage();
    const preferences = new CameraPreferenceStore(storage);

    preferences.savePreferredDevice("   ");

    expect(storage.removeItem).toHaveBeenCalledWith(
      "opera-hero.camera-preferences",
    );
  });

  it("degrades safely when browser storage throws", () => {
    const storage: KeyValueStorage = {
      getItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      setItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      removeItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
    };
    const preferences = new CameraPreferenceStore(storage);

    expect(preferences.load()).toEqual({});
    expect(() => preferences.savePreferredDevice("camera")).not.toThrow();
    expect(() => preferences.clear()).not.toThrow();
  });
});
