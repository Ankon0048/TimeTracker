"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { State, Task } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { columnDndId, taskDndId } from "@/lib/dndIds";

interface BoardColumnProps {
  state: State;
  tasks: Task[];
  projectId: number;
  onDelete: (taskId: number) => void;
  onOpenTask: (taskId: number) => void;
}

export function BoardColumn({ state, tasks, projectId, onDelete, onOpenTask }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDndId(state.id) });

  return (
    <div className="column">
      <div className="column-header">
        {state.name} <span className="text-muted text-sm">({tasks.length})</span>
      </div>
      <div
        ref={setNodeRef}
        className="column-content"
        style={{
          backgroundColor: isOver ? "#e5e7eb" : "transparent",
          transition: "background-color 0.2s ease",
        }}
      >
        <SortableContext
          items={tasks.map((t) => taskDndId(t.id))}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectId={projectId}
              onDelete={onDelete}
              onOpenTask={onOpenTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
