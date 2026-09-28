"use client";

import { Pause, Play, Square } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { liveElapsedSeconds } from "@/features/timers/timersSlice";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useNowTick } from "@/lib/useNowTick";
import { secondsToTimeString, timeStringToSeconds } from "@/lib/time";

interface RunningTaskBannerProps {
  projectId: number;
  onOpenTask: (taskId: number) => void;
}

export function RunningTaskBanner({ projectId, onOpenTask }: RunningTaskBannerProps) {
  const running = useAppSelector((state) => state.timers.running);
  const tasks = useAppSelector((state) => state.tasks.items);
  const { pause, resume, stop } = useTaskTimerActions();
  const now = useNowTick();

  const runningInProject = Object.values(running).filter((t) => t.projectId === projectId);
  if (runningInProject.length === 0) return null;

  return (
    <div className="flex-col gap-4">
      {runningInProject.map((timer) => {
        const task = tasks.find((t) => t.id === timer.taskId);
        const currentSessionSeconds = liveElapsedSeconds(timer, now);
        const totalSeconds =
          (task ? timeStringToSeconds(task.timeTaken) : 0) + currentSessionSeconds;

        return (
          <div
            key={timer.taskId}
            className="card flex-col gap-4"
            style={{
              borderColor: "var(--accent-color)",
              borderWidth: "2px",
              cursor: "pointer",
            }}
            onClick={() => onOpenTask(timer.taskId)}
          >
            <div className="flex-row justify-between items-center">
              <span className="badge">Currently Running</span>
              <div className="flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                {timer.startedAt ? (
                  <button className="btn btn-icon" title="Pause" onClick={() => pause(timer.taskId)}>
                    <Pause size={16} />
                  </button>
                ) : (
                  <button className="btn btn-icon" title="Resume" onClick={() => resume(timer.taskId)}>
                    <Play size={16} />
                  </button>
                )}
                <button className="btn btn-icon" title="Stop" onClick={() => stop(timer.taskId)}>
                  <Square size={16} />
                </button>
              </div>
            </div>

            <div className="flex-col gap-2">
              <h2 style={{ margin: 0 }}>{timer.taskName}</h2>
              {task && (
                <div
                  className="text-muted"
                  dangerouslySetInnerHTML={{ __html: task.description || "No description" }}
                />
              )}
            </div>

            <div className="flex-row gap-6" style={{ flexWrap: "wrap" }}>
              <div className="flex-col">
                <span className="text-xs text-muted">Currently tracked</span>
                <span
                  className="font-bold"
                  style={{ fontSize: "1.5rem", color: "var(--accent-color)" }}
                >
                  {secondsToTimeString(currentSessionSeconds)}
                </span>
              </div>
              <div className="flex-col">
                <span className="text-xs text-muted">Total tracked</span>
                <span className="font-bold" style={{ fontSize: "1.5rem" }}>
                  {secondsToTimeString(totalSeconds)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
