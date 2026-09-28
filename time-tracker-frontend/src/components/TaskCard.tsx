"use client";

import { useState } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Pause, Pencil, Play, Plus, Square, Trash2 } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { selectChildTasks } from "@/features/tasks/tasksSlice";
import { liveElapsedSeconds } from "@/features/timers/timersSlice";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useNowTick } from "@/lib/useNowTick";
import { computeLiveSubtreeSeconds } from "@/lib/subtreeTime";
import { secondsToTimeString } from "@/lib/time";
import { taskDndId } from "@/lib/dndIds";
import type { Task } from "@/lib/types";
import { TaskTreeNode } from "@/components/TaskTreeNode";

interface TaskCardProps {
  task: Task;
  projectId: number;
  onDelete: (taskId: number) => void;
  onOpenTask: (taskId: number) => void;
}

export function TaskCard({ task, projectId, onDelete, onOpenTask }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const children = useAppSelector(selectChildTasks(task.id));
  const tasks = useAppSelector((state) => state.tasks.items);
  const running = useAppSelector((state) => state.timers.running);
  const now = useNowTick();
  const { start, pause, resume, stop } = useTaskTimerActions();

  const timer = running[task.id];
  const isRunning = Boolean(timer);
  const currentSessionSeconds = liveElapsedSeconds(timer, now);
  const subtreeSeconds = computeLiveSubtreeSeconds(tasks, running, now, task.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: taskDndId(task.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
          {isRunning && <span className="badge">Running</span>}
        </div>
        <div className="flex-row gap-2">
          <Link
            href={`/projects/${projectId}/tasks/new?parentId=${task.id}`}
            className="btn btn-icon"
            title="Add subtask"
            onClick={(e) => e.stopPropagation()}
          >
            <Plus size={14} />
          </Link>
          <Link
            href={`/projects/${projectId}/tasks/${task.id}/edit`}
            className="btn btn-icon"
            title="Edit task"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil size={14} />
          </Link>
          <button
            className="btn btn-icon"
            title="Delete task"
            style={{ color: "var(--danger-color)", borderColor: "var(--danger-color)" }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div
        className="text-sm text-muted"
        style={{ cursor: "pointer", minHeight: "1.5rem", padding: "0.25rem 0" }}
        onClick={() => onOpenTask(task.id)}
        dangerouslySetInnerHTML={{ __html: task.description || "No description" }}
      />

      <div
        className="flex-row justify-between items-center"
        style={{
          borderTop: "1px solid #f1f5f9",
          paddingTop: "0.75rem",
          marginTop: "0.25rem",
        }}
      >
        <div className="flex-col gap-1">
          {isRunning && (
            <span className="text-xs font-semibold" style={{ color: "var(--accent-color)" }}>
              Session: {secondsToTimeString(currentSessionSeconds)}
            </span>
          )}
          <span className="text-xs text-muted">
            Total: {secondsToTimeString(subtreeSeconds)}
          </span>
        </div>
        <div className="flex-row gap-2">
          {!isRunning && (
            <button
              className="btn btn-icon"
              title="Start timer"
              onClick={() => start(task, projectId)}
            >
              <Play size={14} />
            </button>
          )}
          {isRunning && timer?.startedAt && (
            <button className="btn btn-icon" title="Pause timer" onClick={() => pause(task.id)}>
              <Pause size={14} />
            </button>
          )}
          {isRunning && !timer?.startedAt && (
            <button className="btn btn-icon" title="Resume timer" onClick={() => resume(task.id)}>
              <Play size={14} />
            </button>
          )}
          {isRunning && (
            <button className="btn btn-icon" title="Stop timer" onClick={() => stop(task.id)}>
              <Square size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && children.length > 0 && (
        <div className="nested-tasks">
          {children.map((child) => (
            <TaskTreeNode key={child.id} task={child} onOpenTask={onOpenTask} />
          ))}
        </div>
      )}
    </div>
  );
}
