"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useToast } from "@/context/ToastContext";
import {
  pauseTimer,
  resumeTimer,
  startTimer,
  stopTimer,
  liveElapsedSeconds,
} from "@/features/timers/timersSlice";
import { updateTask } from "@/features/tasks/tasksSlice";
import { findConflictingRunningRelative } from "@/lib/taskHierarchy";
import { secondsToTimeString, timeStringToSeconds } from "@/lib/time";
import type { Task } from "@/lib/types";

export function useTaskTimerActions() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const tasks = useAppSelector((state) => state.tasks.items);
  const running = useAppSelector((state) => state.timers.running);
  const states = useAppSelector((state) => state.states.items);

  const ongoingStateId =
    states.find((s) => s.name.toLowerCase() === "ongoing")?.id ?? null;
  const completedStateId =
    states.find((s) => s.name.toLowerCase() === "completed")?.id ?? null;

  const runningIds = Object.keys(running).map(Number);

  // A task and any of its ancestors/descendants can't track time at once —
  // that would double-count the same work in the subtree total. Unrelated
  // task trees are unaffected and can run at the same time.
  const start = (
    task: Task,
    projectId: number,
    opts: { syncState?: boolean } = {}
  ): boolean => {
    const { syncState = true } = opts;
    const conflictId = findConflictingRunningRelative(tasks, runningIds, task.id);
    if (conflictId !== null) {
      const conflict = tasks.find((t) => t.id === conflictId);
      showToast(
        `Stop "${conflict?.name ?? "the related task"}" first — a task and its parent/subtasks can't track time at the same time.`,
        "error"
      );
      return false;
    }

    dispatch(startTimer({ taskId: task.id, taskName: task.name, projectId }));
    if (syncState && ongoingStateId && task.stateID !== ongoingStateId) {
      dispatch(updateTask({ id: task.id, payload: { stateID: ongoingStateId } }));
    }
    return true;
  };

  const pause = (taskId: number) => dispatch(pauseTimer(taskId));
  const resume = (taskId: number) => dispatch(resumeTimer(taskId));

  const stop = (taskId: number, opts: { syncState?: boolean } = {}) => {
    const { syncState = true } = opts;
    const timer = running[taskId];
    const task = tasks.find((t) => t.id === taskId);
    const elapsed = liveElapsedSeconds(timer, Date.now());

    dispatch(stopTimer(taskId));

    if (!task) return;
    const newTotalSeconds = timeStringToSeconds(task.timeTaken) + elapsed;
    dispatch(
      updateTask({
        id: taskId,
        payload: {
          timeTaken: secondsToTimeString(newTotalSeconds),
          end: new Date().toISOString(),
          ...(syncState && completedStateId ? { stateID: completedStateId } : {}),
        },
      })
    );
  };

  return { start, pause, resume, stop, ongoingStateId, completedStateId };
}
