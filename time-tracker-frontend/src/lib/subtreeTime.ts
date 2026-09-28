import type { Task } from "@/lib/types";
import { timeStringToSeconds } from "@/lib/time";
import { getDescendantIds } from "@/lib/taskHierarchy";
import { liveElapsedSeconds, type RunningTimer } from "@/features/timers/timersSlice";

/**
 * Total tracked time for a task's whole subtree (itself plus every
 * descendant's persisted `timeTaken`), in seconds. E.g. for 1 -> 2 -> 3 with
 * 10/20/30 minutes tracked respectively: subtree(1) = 60m, subtree(2) = 50m,
 * subtree(3) = 30m.
 */
export function computeSubtreeSeconds(tasks: Task[], taskId: number): number {
  const children = new Map<number, Task[]>();
  for (const task of tasks) {
    if (task.parentID === null) continue;
    if (!children.has(task.parentID)) children.set(task.parentID, []);
    children.get(task.parentID)!.push(task);
  }
  const byId = new Map(tasks.map((t) => [t.id, t]));

  const sum = (id: number): number => {
    const task = byId.get(id);
    if (!task) return 0;
    let total = timeStringToSeconds(task.timeTaken);
    for (const child of children.get(id) ?? []) {
      total += sum(child.id);
    }
    return total;
  };

  return sum(taskId);
}

/**
 * Same as computeSubtreeSeconds, but also adds the live, still-running
 * elapsed time of the task itself and any of its descendants that are
 * currently tracked — so the tree total stays accurate second to second.
 */
export function computeLiveSubtreeSeconds(
  tasks: Task[],
  running: Record<number, RunningTimer>,
  now: number,
  taskId: number
): number {
  const base = computeSubtreeSeconds(tasks, taskId);
  const subtreeIds = [taskId, ...getDescendantIds(tasks, taskId)];
  const liveExtra = subtreeIds.reduce(
    (sum, id) => sum + liveElapsedSeconds(running[id], now),
    0
  );
  return base + liveExtra;
}
