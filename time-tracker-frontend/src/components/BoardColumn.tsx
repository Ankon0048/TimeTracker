"use client";

import { useDroppable } from "@dnd-kit/core";
import type { State, Task } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";

interface BoardColumnProps {
  state: State;
  tasks: Task[];
  projectId: number;
  runningTaskId: number | null;
  runningTaskState: "ongoing" | "paused" | null;
  runningTaskElapsedTime: number;
  onStart: (taskId: number) => void;
  onPause: (taskId: number) => void;
  onResume: (taskId: number) => void;
  onStop: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

export function BoardColumn({
  state,
  tasks,
  projectId,
  runningTaskId,
  runningTaskState,
  runningTaskElapsedTime,
  onStart,
  onPause,
  onResume,
  onStop,
  onDelete,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: state.id });

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
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            projectId={projectId}
            isRunning={runningTaskId === task.id}
            runningState={runningTaskId === task.id ? runningTaskState : null}
            elapsedSeconds={runningTaskElapsedTime}
            onStart={onStart}
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
