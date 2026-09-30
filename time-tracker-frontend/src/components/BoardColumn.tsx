"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Badge, Text } from "@mantine/core";
import type { State, Task } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { columnDndId, taskDndId } from "@/lib/dndIds";

interface BoardColumnProps {
  state: State;
  tasks: Task[];
  projectId: number;
  onDelete: (task: Task) => void;
  onOpenTask: (taskId: number) => void;
}

export function BoardColumn({ state, tasks, projectId, onDelete, onOpenTask }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDndId(state.id) });

  return (
    <div className="board-column">
      <div className="board-column-header">
        <Text fw={600} size="sm" truncate>
          {state.name}
        </Text>
        <Badge variant="default" size="sm" radius="sm">
          {tasks.length}
        </Badge>
      </div>
      <div ref={setNodeRef} className="board-column-content" data-over={isOver}>
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
        {tasks.length === 0 && (
          <Text size="xs" c="dimmed" ta="center" py="lg">
            Drop tasks here
          </Text>
        )}
      </div>
    </div>
  );
}
