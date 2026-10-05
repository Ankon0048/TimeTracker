import type { RunningTimer } from "@/features/timers/timersSlice";

export const TIMERS_STORAGE_KEY = "timetracker.runningTimers";

// Storage can be unavailable (private mode, blocked site data), so every
// access is guarded; a failure just means timers won't survive a reload.
export function loadTimers(): Record<number, RunningTimer> {
  try {
    const raw = window.localStorage.getItem(TIMERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    const timers: Record<number, RunningTimer> = {};
    for (const value of Object.values(parsed as Record<string, unknown>)) {
      const t = value as Partial<RunningTimer> | null;
      if (
        t &&
        typeof t.taskId === "number" &&
        typeof t.projectId === "number" &&
        typeof t.taskName === "string" &&
        typeof t.accumulatedSeconds === "number" &&
        (t.startedAt === null || typeof t.startedAt === "number")
      ) {
        timers[t.taskId] = t as RunningTimer;
      }
    }
    return timers;
  } catch {
    return {};
  }
}

export function saveTimers(running: Record<number, RunningTimer>) {
  try {
    if (Object.keys(running).length === 0) {
      window.localStorage.removeItem(TIMERS_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(running));
    }
  } catch {
    // Ignore: see loadTimers.
  }
}
