import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import type { State, Task } from "../services/api";
import { TaskCard } from "./TaskCard";

interface BoardColumnProps {
  state: State;
  tasks: Task[];
  allTasks: Task[];
  ongoingStateId: number | null;
  pendingStateId: number | null;
  completedStateId: number | null;
  runningTaskId: number | null;
  runningTaskState: "ongoing" | "paused" | null;
  runningTaskElapsedTime: number;
  onStart: (taskId: number) => void;
  onPause: (taskId: number) => void;
  onResume: (taskId: number) => void;
  onStop: (taskId: number) => void;
  onOpenModal: (parentId: number | null) => void;
  onDelete: (taskId: number) => void;
  onViewTask: (task: Task) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  state,
  tasks,
  allTasks,
  ongoingStateId,
  pendingStateId,
  completedStateId,
  runningTaskId,
  runningTaskState,
  runningTaskElapsedTime,
  onStart,
  onPause,
  onStop,
  onOpenModal,
  onDelete,
  onResume,
  onViewTask,
}) => {
  const isPending = state.name.toLowerCase() === "pending";

  return (
    <div className="column">
      <div className="column-header">
        {state.name}{" "}
        <span className="text-muted text-sm ml-2">({tasks.length})</span>
      </div>
      {isPending && (
        <div style={{ padding: "8px 1rem 0.5rem" }}>
          <button
            className="btn btn-outline-primary"
            style={{ width: "100%" }}
            onClick={() => onOpenModal(null)}
          >
            Add Task
          </button>
        </div>
      )}
      <Droppable droppableId={state.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="column-content"
            style={{
              backgroundColor: snapshot.isDraggingOver
                ? "#e5e7eb"
                : "transparent",
              transition: "background-color 0.2s ease",
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                allTasks={allTasks}
                ongoingStateId={ongoingStateId}
                pendingStateId={pendingStateId}
                completedStateId={completedStateId}
                runningTaskId={runningTaskId}
                runningTaskState={runningTaskState}
                runningTaskElapsedTime={runningTaskElapsedTime}
                onStart={onStart}
                onPause={onPause}
                onStop={onStop}
                onResume={onResume}
                onOpenModal={onOpenModal}
                onDelete={onDelete}
                onViewTask={onViewTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
