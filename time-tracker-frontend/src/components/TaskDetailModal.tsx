"use client";

import { useState } from "react";
import { Pause, Pencil, Play, Save, Square, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateTask } from "@/features/tasks/tasksSlice";
import { liveElapsedSeconds } from "@/features/timers/timersSlice";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useNowTick } from "@/lib/useNowTick";
import { secondsToTimeString, timeStringToSeconds } from "@/lib/time";
import { RichTextEditor } from "@/components/RichTextEditor";

interface TaskDetailModalProps {
  taskId: number | null;
  projectId: number;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, projectId, onClose }: TaskDetailModalProps) {
  const dispatch = useAppDispatch();
  const task = useAppSelector((state) =>
    taskId != null ? state.tasks.items.find((t) => t.id === taskId) : undefined
  );
  const timer = useAppSelector((state) =>
    taskId != null ? state.timers.running[taskId] : undefined
  );
  const { start, pause, resume, stop } = useTaskTimerActions();
  const now = useNowTick();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");

  if (!taskId || !task) return null;

  const isRunning = Boolean(timer);
  const currentSessionSeconds = liveElapsedSeconds(timer, now);
  const totalSeconds = timeStringToSeconds(task.timeTaken) + currentSessionSeconds;

  const handleSave = () => {
    dispatch(
      updateTask({
        id: task.id,
        payload: { name: name.trim() || task.name, description },
      })
    );
    setIsEditing(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <div
        className="card flex-col gap-4"
        style={{
          width: "600px",
          maxWidth: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "var(--bg-primary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-row justify-between items-center">
          <h2>Task Details</h2>
          <button className="btn btn-icon" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="flex-col gap-2">
          <label className="text-sm font-medium">Name</label>
          {isEditing ? (
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <h3 style={{ margin: 0 }}>{task.name}</h3>
          )}
        </div>

        <div className="flex-col gap-2">
          <label className="text-sm font-medium">Description</label>
          {isEditing ? (
            <RichTextEditor value={description} onChange={setDescription} />
          ) : (
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: task.description || "No description" }}
            />
          )}
        </div>

        <div className="card flex-col gap-2" style={{ backgroundColor: "#eff6ff" }}>
          <div className="flex-row justify-between items-center">
            <span className="text-sm font-medium">Currently tracked (this session)</span>
            <span className="font-bold" style={{ color: "var(--accent-color)" }}>
              {isRunning ? secondsToTimeString(currentSessionSeconds) : "00:00:00"}
            </span>
          </div>
          <div className="flex-row justify-between items-center">
            <span className="text-sm font-medium">Total time taken</span>
            <span className="font-bold">{secondsToTimeString(totalSeconds)}</span>
          </div>
        </div>

        <div className="flex-row justify-between items-center">
          <div className="flex-row gap-2">
            {!isRunning && (
              <button className="btn btn-primary" onClick={() => start(task, projectId)}>
                <Play size={14} style={{ marginRight: "0.375rem" }} />
                Start
              </button>
            )}
            {isRunning && timer?.startedAt && (
              <button className="btn" onClick={() => pause(task.id)}>
                <Pause size={14} style={{ marginRight: "0.375rem" }} />
                Pause
              </button>
            )}
            {isRunning && !timer?.startedAt && (
              <button className="btn" onClick={() => resume(task.id)}>
                <Play size={14} style={{ marginRight: "0.375rem" }} />
                Resume
              </button>
            )}
            {isRunning && (
              <button className="btn" onClick={() => stop(task.id)}>
                <Square size={14} style={{ marginRight: "0.375rem" }} />
                Stop
              </button>
            )}
          </div>

          <div className="flex-row gap-2">
            {isEditing ? (
              <>
                <button
                  className="btn btn-icon"
                  onClick={handleSave}
                  title="Save"
                  style={{ color: "var(--success-color)", borderColor: "var(--success-color)" }}
                >
                  <Save size={16} />
                </button>
                <button
                  className="btn btn-icon"
                  onClick={() => {
                    setName(task.name);
                    setDescription(task.description);
                    setIsEditing(false);
                  }}
                  title="Cancel"
                  style={{ color: "var(--danger-color)", borderColor: "var(--danger-color)" }}
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <button className="btn btn-icon" onClick={() => setIsEditing(true)} title="Edit">
                <Pencil size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
