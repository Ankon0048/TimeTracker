import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import {
  Play,
  Pause,
  Square,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import type { Task } from "../services/api";
import { formatStopwatch, timeStringToSeconds } from "../utils/time";

interface TaskCardProps {
  task: Task;
  index: number;
  allTasks: Task[];
  ongoingStateId: number | null;
  pendingStateId: number | null;
  completedStateId: number | null;
  runningTaskId: number | null;
  runningTaskState: "ongoing" | "paused" | null;
  runningTaskElapsedTime: number; // passed down continuously if this is the running task
  onStart: (taskId: number) => void;
  onPause: (taskId: number) => void;
  onStop: (taskId: number) => void;
  onOpenModal: (parentId: number | null) => void;
  onDelete: (taskId: number) => void;
  onResume: (taskId: number) => void;
  onViewTask: (task: Task) => void;
  parentIsRunning?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
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
  onResume,
  onOpenModal,
  onDelete,
  onViewTask,
  parentIsRunning = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  // A task is considered running if it is the running task, OR if its parent is running
  const isDirectlyRunning = runningTaskId === task.id;
  const isRunning = isDirectlyRunning || parentIsRunning;

  // Compute children
  const children = allTasks.filter((t) => t.parentID === task.id);
  const hasChildren = children.length > 0;

  // Determine static time taken + dynamic elapsed
  const totalTimeInSeconds = timeStringToSeconds(task.timeTaken);

  let ongoingDisplay = "00:00";
  if (isDirectlyRunning) {
    // Show elapsed time whether running or paused
    ongoingDisplay = formatStopwatch(runningTaskElapsedTime);
  }

  // Format start date: dd/MM/YY hh:mm AM/PM
  const formatStartDate = (isoStr: string) => {
    const d = new Date(isoStr);
    const datePart = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} ${timePart}`;
  };

  // Only the directly running task (or pending/ongoing) shows controls?
  // "A task in Pending or Ongoing state shows a single Play icon"
  // "tasks in any state other than Pending or Ongoing do not get a Play button at all."
  const isPending = task.stateID === pendingStateId;
  const isOngoing = task.stateID === ongoingStateId;
  const isCompleted = task.stateID === completedStateId;

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? "is-dragging" : ""} ${
            isRunning ? "is-ongoing" : ""
          }`}
          style={{ ...provided.draggableProps.style, cursor: "pointer" }}
          onClick={() => onViewTask(task)}
        >
          <div className="flex-row justify-between items-center">
            <h4 style={{ margin: 0 }}>{task.name}</h4>
            <div className="flex-row gap-2 items-center">
              <div
                className="flex-col text-xs"
                style={{ alignItems: "flex-end" }}
              >
                <span className="text-muted">Ongoing: {ongoingDisplay}</span>
                <span style={{ fontWeight: "normal", color: "inherit" }}>
                  Total: {formatStopwatch(totalTimeInSeconds)}
                </span>
              </div>

              {/* Controls */}
              {(isPending || isOngoing) && !isRunning && !isCompleted && (
                <button
                  className="btn btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(task.id);
                  }}
                  title="Start Task"
                >
                  <Play size={10} />
                </button>
              )}
              <div className="flex flex-col gap-1">
                {isDirectlyRunning && (
                  <>
                    <button
                      className="btn btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        runningTaskState === "paused"
                          ? onResume(task.id)
                          : onPause(task.id);
                      }}
                      title={runningTaskState === "paused" ? "Resume" : "Pause"}
                    >
                      {runningTaskState === "paused" ? (
                        <Play size={10} />
                      ) : (
                        <Pause size={10} />
                      )}
                    </button>
                    <button
                      className="btn btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStop(task.id);
                      }}
                      title="Stop Task"
                    >
                      <Square size={10} />
                    </button>
                  </>
                )}
                <button
                  className="btn btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  title="Delete Task"
                  style={{
                    color: "var(--danger-color)",
                    borderColor: "var(--danger-color)",
                  }}
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </div>
          <div
            className="flex-col gap-1 text-xs text-muted"
            style={{ marginTop: "0.5rem" }}
          >
            <span>Start: {formatStartDate(task.start)}</span>
          </div>

          {/* Nested Tasks Toggle & Add Child */}
          <div
            className="flex-row gap-2"
            style={{ marginTop: "0.5rem", width: "100%" }}
          >
            <button
              className="btn"
              style={{ flexGrow: 1, justifyContent: "space-between" }}
              disabled={!hasChildren}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              <span>
                {hasChildren
                  ? `Show Nested Tasks (${children.length})`
                  : "No Nested Tasks"}
              </span>
              {hasChildren &&
                (expanded ? (
                  <ChevronDown size={10} />
                ) : (
                  <ChevronRight size={10} />
                ))}
            </button>
            <button
              className="btn btn-icon"
              style={{ flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(task.id);
              }}
              title="Add Child Task"
            >
              <Plus />
            </button>
          </div>

          {/* Expanded Nested Tasks */}
          {expanded && hasChildren && (
            <div className="nested-tasks">
              {children.map((child, idx) => (
                <TaskCard
                  key={child.id}
                  task={child}
                  index={idx}
                  allTasks={allTasks}
                  ongoingStateId={ongoingStateId}
                  pendingStateId={pendingStateId}
                  completedStateId={completedStateId}
                  runningTaskId={runningTaskId}
                  runningTaskState={runningTaskState}
                  runningTaskElapsedTime={runningTaskElapsedTime}
                  onStart={onStart}
                  onPause={onPause}
                  onResume={onResume}
                  onStop={onStop}
                  onOpenModal={onOpenModal}
                  onDelete={onDelete}
                  onViewTask={onViewTask}
                  parentIsRunning={isRunning}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
