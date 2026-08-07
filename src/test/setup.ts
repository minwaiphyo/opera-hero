import "@testing-library/jest-dom/vitest";

/**
 * jsdom has no media pipeline, so any component containing a <video> — the practitioner
 * guide, the camera source — floods the run with "Not implemented" noise. Plain functions
 * rather than `vi.fn()`, so the config's `clearMocks` cannot strip the implementation
 * back out between tests; a test that needs to observe playback spies on them itself.
 */
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  writable: true,
  value: () => Promise.resolve(),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  writable: true,
  value: () => undefined,
});
