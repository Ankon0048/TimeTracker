"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { selectChildTasks } from "@/features/tasks/tasksSlice";
import { computeLiveSubtreeSeconds } from "@/lib/subtreeTime";
import { useNowTick } from "@/lib/useNowTick";
import { secondsToTimeString } from "@/lib/time";
import type { Task } from "@/lib/types";

interface TaskTreeNodeProps {
  task: Task;
  onOpenTask?: (taskId: number) => void;
}

export function TaskTreeNode({ task, onOpenTask }: TaskTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const children = useAppSelector(selectChildTasks(task.id));
  const states = useAppSelector((state) => state.states.items);
  const tasks = useAppSelector((state) => state.tasks.items);
  const running = useAppSelector((state) => state.timers.running);
  const now = useNowTick();

  const stateName = states.find((s) => s.id === task.stateID)?.name;
  const isRunning = Boolean(running[task.id]);
  const subtreeSeconds = computeLiveSubtreeSeconds(tasks, running, now, task.id);

  return (
    <div
      className="task-card"
      style={{ cursor: onOpenTask ? "pointer" : undefined }}
      onClick={() => onOpenTask?.(task.id)}
    >
      <div className="flex-row justify-between items-center">
        <div className="flex-row gap-2 items-center">
          {children.length > 0 ? (
            <button
              type="button"
              className="btn btn-icon"
              style={{ width: "1.75rem", height: "1.75rem", padding: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span style={{ width: "1.75rem" }} />
          )}
          <span className="font-bold">{task.name}</span>
        </div>
        <div className="flex-row gap-2 items-center">
          {isRunning && <span className="badge">Running</span>}
          {stateName && <span className="badge">{stateName}</span>}
        </div>
      </div>

      <div
        className="text-sm text-muted"
        style={{ paddingLeft: "2.25rem" }}
        dangerouslySetInnerHTML={{
          __html: task.description || "No description",
        }}
      />

      <div className="text-xs text-muted" style={{ paddingLeft: "2.25rem" }}>
        Total tracked time (incl. subtasks): {secondsToTimeString(subtreeSeconds)}
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
