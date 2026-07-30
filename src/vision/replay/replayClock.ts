export type ReplayTimerHandle = ReturnType<typeof setTimeout>;

export interface ReplayClock {
  now(): number;
  setTimer(callback: () => void, delayMs: number): ReplayTimerHandle;
  clearTimer(handle: ReplayTimerHandle): void;
}

export const browserReplayClock: ReplayClock = {
  now: () => performance.now(),
  setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimer: (handle) => clearTimeout(handle),
};
