// Task ids and state ids are both plain auto-increment integers, so dnd-kit's
// flat id namespace needs a prefix to tell "task 1" and "column (state) 1"
// apart when resolving drag/drop targets.
export const taskDndId = (taskId: number): string => `task-${taskId}`;
export const columnDndId = (stateId: number): string => `column-${stateId}`;

export function parseDndId(id: string | number): { type: "task" | "column"; id: number } | null {
  const str = String(id);
  if (str.startsWith("task-")) return { type: "task", id: Number(str.slice(5)) };
  if (str.startsWith("column-")) return { type: "column", id: Number(str.slice(7)) };
  return null;
}
