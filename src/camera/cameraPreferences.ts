export type CameraPreferences = {
  preferredDeviceId?: string;
};

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type StoredCameraPreferences = {
  version: 1;
  preferredDeviceId?: string;
};

const STORAGE_KEY = "opera-hero.camera-preferences";

export class CameraPreferenceStore {
  readonly #storage: KeyValueStorage | undefined;

  constructor(storage: KeyValueStorage | undefined = window.localStorage) {
    this.#storage = storage;
  }

  load(): CameraPreferences {
    let raw: string | null;

    try {
      raw = this.#storage?.getItem(STORAGE_KEY) ?? null;
    } catch {
      return {};
    }

    if (!raw) {
      return {};
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.clear();
      return {};
    }

    if (!isStoredCameraPreferences(parsed)) {
      this.clear();
      return {};
    }

    return parsed.preferredDeviceId
      ? { preferredDeviceId: parsed.preferredDeviceId }
      : {};
  }

  savePreferredDevice(deviceId: string): void {
    const normalized = deviceId.trim();
    if (!normalized) {
      this.clear();
      return;
    }

    const value: StoredCameraPreferences = {
      version: 1,
      preferredDeviceId: normalized,
    };

    try {
      this.#storage?.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Preferences improve setup convenience but must never block camera use.
    }
  }

  clear(): void {
    try {
      this.#storage?.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable in restricted browser profiles.
    }
  }
}

function isStoredCameraPreferences(
  value: unknown,
): value is StoredCameraPreferences {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.version !== 1) {
    return false;
  }

  return (
    candidate.preferredDeviceId === undefined ||
    (typeof candidate.preferredDeviceId === "string" &&
      candidate.preferredDeviceId.trim().length > 0)
  );
}
