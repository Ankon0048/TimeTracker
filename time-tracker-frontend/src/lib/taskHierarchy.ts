import type { Task } from "@/lib/types";

export function getAncestorIds(tasks: Task[], taskId: number): number[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const ancestors: number[] = [];
  let current = byId.get(taskId);
  while (current && current.parentID !== null) {
    ancestors.push(current.parentID);
    current = byId.get(current.parentID);
  }
  return ancestors;
}

export function getDescendantIds(tasks: Task[], taskId: number): number[] {
  const children = new Map<number, number[]>();
  for (const task of tasks) {
    if (task.parentID === null) continue;
    if (!children.has(task.parentID)) children.set(task.parentID, []);
    children.get(task.parentID)!.push(task.id);
  }

  const descendants: number[] = [];
  const stack = [...(children.get(taskId) ?? [])];
  while (stack.length > 0) {
    const id = stack.pop()!;
    descendants.push(id);
    stack.push(...(children.get(id) ?? []));
  }
  return descendants;
}

/**
 * A task's timer may only run alone within its ancestor chain — starting it
 * while an ancestor or descendant is already tracked would double-count the
 * same work. Unrelated task trees are unaffected and can run concurrently.
 * Returns the id of the conflicting task, or null if starting is allowed.
 */
export function findConflictingRunningRelative(
  tasks: Task[],
  runningTaskIds: number[],
  taskId: number
): number | null {
  const related = new Set([
    ...getAncestorIds(tasks, taskId),
    ...getDescendantIds(tasks, taskId),
  ]);
  for (const runningId of runningTaskIds) {
    if (runningId !== taskId && related.has(runningId)) {
      return runningId;
    }
  }
  return null;
}

/** The top-level (parentless) task at the root of the tree `taskId` belongs to. */
export function getRootTaskId(tasks: Task[], taskId: number): number {
  const ancestors = getAncestorIds(tasks, taskId);
  return ancestors.length > 0 ? ancestors[ancestors.length - 1] : taskId;
}

export interface TaskTreeNode {
  task: Task;
  children: TaskTreeNode[];
}

/** Nested tree of `rootId` and all its descendants, siblings sorted by order. */
export function buildTaskTree(tasks: Task[], rootId: number): TaskTreeNode | null {
  const children = new Map<number, Task[]>();
  for (const task of tasks) {
    if (task.parentID === null) continue;
    if (!children.has(task.parentID)) children.set(task.parentID, []);
    children.get(task.parentID)!.push(task);
  }
  const root = tasks.find((t) => t.id === rootId);
  if (!root) return null;

  const build = (task: Task): TaskTreeNode => ({
    task,
    children: (children.get(task.id) ?? [])
      .slice()
      .sort((a, b) => a.order - b.order || a.id - b.id)
      .map(build),
  });
  return build(root);
}
