"use client";

import { useState } from "react";
import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Pause, Pencil, Play, Plus, Square, Trash2 } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { selectChildTasks } from "@/features/tasks/tasksSlice";
import { formatStopwatch } from "@/lib/time";
import type { Task } from "@/lib/types";
import { TaskTreeNode } from "@/components/TaskTreeNode";

interface TaskCardProps {
  task: Task;
  projectId: number;
  isRunning: boolean;
  runningState: "ongoing" | "paused" | null;
  elapsedSeconds: number;
  onStart: (taskId: number) => void;
  onPause: (taskId: number) => void;
  onResume: (taskId: number) => void;
  onStop: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

export function TaskCard({
  task,
  projectId,
  isRunning,
  runningState,
  elapsedSeconds,
  onStart,
  onPause,
  onResume,
  onStop,
  onDelete,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const children = useAppSelector(selectChildTasks(task.id));

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="task-card">
      <div className="flex-row justify-between items-center">
        <div
          className="flex-row gap-2 items-center"
          style={{ cursor: "grab", flex: 1 }}
          {...listeners}
          {...attributes}
        >
          {children.length > 0 ? (
            <button
              type="button"
              className="btn btn-icon"
              style={{ width: "1.5rem", height: "1.5rem", padding: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
            <span style={{ width: "1.5rem" }} />
          )}
          <span className="font-bold">{task.name}</span>
        </div>
        <div className="flex-row gap-2">
          <Link
            href={`/projects/${projectId}/tasks/new?parentId=${task.id}`}
            className="btn btn-icon"
            title="Add subtask"
          >
            <Plus size={14} />
          </Link>
          <Link
            href={`/projects/${projectId}/tasks/${task.id}/edit`}
            className="btn btn-icon"
            title="Edit task"
          >
            <Pencil size={14} />
          </Link>
          <button
            className="btn btn-icon"
            title="Delete task"
            style={{ color: "var(--danger-color)", borderColor: "var(--danger-color)" }}
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div
        className="text-sm text-muted"
        dangerouslySetInnerHTML={{ __html: task.description || "No description" }}
      />

      <div className="flex-row justify-between items-center">
        <span className="text-xs text-muted">
          {isRunning
            ? `Tracking: ${formatStopwatch(elapsedSeconds)}`
            : `Time tracked: ${task.timeTaken}`}
        </span>
        <div className="flex-row gap-2">
          {!isRunning && (
            <button
              className="btn btn-icon"
              title="Start timer"
              onClick={() => onStart(task.id)}
            >
              <Play size={14} />
            </button>
          )}
          {isRunning && runningState === "ongoing" && (
            <button className="btn btn-icon" title="Pause timer" onClick={() => onPause(task.id)}>
              <Pause size={14} />
            </button>
          )}
          {isRunning && runningState === "paused" && (
            <button className="btn btn-icon" title="Resume timer" onClick={() => onResume(task.id)}>
              <Play size={14} />
            </button>
          )}
          {isRunning && (
            <button className="btn btn-icon" title="Stop timer" onClick={() => onStop(task.id)}>
              <Square size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && children.length > 0 && (
        <div className="nested-tasks">
          {children.map((child) => (
            <TaskTreeNode key={child.id} task={child} />
          ))}
        </div>
      )}
    </div>
  );
}
