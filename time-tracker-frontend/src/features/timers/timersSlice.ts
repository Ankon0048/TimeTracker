import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

export interface RunningTimer {
  taskId: number;
  taskName: string;
  projectId: number;
  // ms epoch the current running segment started at, or null while paused.
  startedAt: number | null;
  // seconds accumulated in this run before the current segment (paused time).
  accumulatedSeconds: number;
}

interface TimersState {
  running: Record<number, RunningTimer>;
}

const initialState: TimersState = {
  running: {},
};

const timersSlice = createSlice({
  name: "timers",
  initialState,
  reducers: {
    // Independent per task: starting one task's timer never touches another's,
    // so unrelated tasks can run concurrently.
    startTimer: (
      state,
      action: PayloadAction<{ taskId: number; taskName: string; projectId: number }>
    ) => {
      const { taskId, taskName, projectId } = action.payload;
      state.running[taskId] = {
        taskId,
        taskName,
        projectId,
        startedAt: Date.now(),
        accumulatedSeconds: 0,
      };
    },
    pauseTimer: (state, action: PayloadAction<number>) => {
      const timer = state.running[action.payload];
      if (!timer || timer.startedAt === null) return;
      timer.accumulatedSeconds += Math.floor((Date.now() - timer.startedAt) / 1000);
      timer.startedAt = null;
    },
    resumeTimer: (state, action: PayloadAction<number>) => {
      const timer = state.running[action.payload];
      if (!timer || timer.startedAt !== null) return;
      timer.startedAt = Date.now();
    },
    stopTimer: (state, action: PayloadAction<number>) => {
      delete state.running[action.payload];
    },
    // Pauses every ticking timer as of `at` (ms epoch), so time spent idle
    // before the pause was noticed isn't counted.
    pauseAllTimers: (state, action: PayloadAction<{ at: number }>) => {
      for (const timer of Object.values(state.running)) {
        if (timer.startedAt === null) continue;
        const end = Math.max(action.payload.at, timer.startedAt);
        timer.accumulatedSeconds += Math.floor((end - timer.startedAt) / 1000);
        timer.startedAt = null;
      }
    },
    // Replaces the running timers wholesale, e.g. with the copy saved in
    // localStorage after a reload or written by another tab.
    hydrateTimers: (state, action: PayloadAction<Record<number, RunningTimer>>) => {
      state.running = action.payload;
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  pauseAllTimers,
  hydrateTimers,
} = timersSlice.actions;

const selectRunning = (state: RootState) => state.timers.running;

export const selectRunningTimer = (taskId: number) => (state: RootState) =>
  state.timers.running[taskId];

export const selectRunningTimersList = createSelector([selectRunning], (running) =>
  Object.values(running).sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))
);

export const selectRunningCount = createSelector(
  [selectRunning],
  (running) => Object.keys(running).length
);

// Elapsed seconds of the current run, live (includes the still-ticking segment).
export function liveElapsedSeconds(timer: RunningTimer | undefined, now: number): number {
  if (!timer) return 0;
  const runningSegment = timer.startedAt ? Math.floor((now - timer.startedAt) / 1000) : 0;
  return timer.accumulatedSeconds + runningSegment;
}

export default timersSlice.reducer;
