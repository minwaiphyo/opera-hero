export type CapabilityState = "available" | "unavailable" | "unknown";

export type Capability = {
  id: string;
  label: string;
  state: CapabilityState;
  detail: string;
  required: boolean;
};

export type BrowserBaseline = {
  capturedAt: string;
  userAgent: string;
  language: string;
  online: boolean;
  viewport: {
    width: number;
    height: number;
    pixelRatio: number;
    orientation: string;
  };
  capabilities: Capability[];
};

const stateFrom = (value: boolean): CapabilityState =>
  value ? "available" : "unavailable";

export function collectBrowserBaseline(): BrowserBaseline {
  const mediaDevices = navigator.mediaDevices;
  const cameraApi = typeof mediaDevices?.getUserMedia === "function";
  const audioContext =
    "AudioContext" in window || "webkitAudioContext" in window;

  return {
    capturedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    online: navigator.onLine,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      orientation:
        window.screen.orientation?.type ??
        (window.innerWidth >= window.innerHeight ? "landscape" : "portrait"),
    },
    capabilities: [
      {
        id: "camera-api",
        label: "Camera API",
        state: stateFrom(cameraApi),
        detail: cameraApi
          ? "getUserMedia is exposed on this origin."
          : "A secure localhost origin and supported browser are required.",
        required: true,
      },
      {
        id: "worker",
        label: "Web Worker",
        state: stateFrom("Worker" in window),
        detail: "Keeps vision inference away from the interface thread.",
        required: true,
      },
      {
        id: "wasm",
        label: "WebAssembly",
        state: stateFrom("WebAssembly" in window),
        detail: "Required as the broadly compatible inference runtime.",
        required: true,
      },
      {
        id: "webgl2",
        label: "WebGL 2",
        state: stateFrom(hasWebGl2()),
        detail: "Available as a graphics and inference acceleration fallback.",
        required: false,
      },
      {
        id: "webgpu",
        label: "WebGPU",
        state: stateFrom("gpu" in navigator),
        detail: "Optional acceleration path; not required for the first model.",
        required: false,
      },
      {
        id: "offscreen-canvas",
        label: "OffscreenCanvas",
        state: stateFrom("OffscreenCanvas" in window),
        detail: "Optional worker-side image preparation and rendering.",
        required: false,
      },
      {
        id: "web-audio",
        label: "Web Audio",
        state: stateFrom(audioContext),
        detail: "Supports scheduled narration, music, and feedback cues.",
        required: true,
      },
      {
        id: "indexed-db",
        label: "IndexedDB",
        state: stateFrom("indexedDB" in window),
        detail: "Stores bounded anonymous operational diagnostics.",
        required: true,
      },
    ],
  };
}

function hasWebGl2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function requiredCapabilitiesPass(baseline: BrowserBaseline): boolean {
  return baseline.capabilities
    .filter((capability) => capability.required)
    .every((capability) => capability.state === "available");
}
