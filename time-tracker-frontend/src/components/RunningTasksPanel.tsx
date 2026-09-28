"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Square } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { liveElapsedSeconds, selectRunningTimersList } from "@/features/timers/timersSlice";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useNowTick } from "@/lib/useNowTick";
import { secondsToTimeString } from "@/lib/time";

export function RunningTasksPanel() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timers = useAppSelector(selectRunningTimersList);
  const { stop } = useTaskTimerActions();
  const now = useNowTick();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="btn btn-icon"
        onClick={() => setOpen((prev) => !prev)}
        title="Running tasks"
        style={{ position: "relative" }}
      >
        <Bell size={18} />
        {timers.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "18px",
              height: "18px",
              borderRadius: "999px",
              backgroundColor: "var(--danger-color)",
              color: "white",
              fontSize: "0.6875rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {timers.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card flex-col gap-2"
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            right: 0,
            width: "340px",
            maxHeight: "420px",
            overflowY: "auto",
            zIndex: 30,
          }}
        >
          <h3 style={{ margin: 0 }}>Running Tasks</h3>
          {timers.length === 0 ? (
            <p className="text-muted text-sm">No tasks are currently running.</p>
          ) : (
            timers.map((timer) => (
              <div
                key={timer.taskId}
                className="flex-row justify-between items-center"
                style={{
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <Link
                  href={`/projects/${timer.projectId}`}
                  className="flex-col"
                  onClick={() => setOpen(false)}
                >
                  <span className="font-medium text-sm">{timer.taskName}</span>
                  <span className="text-xs" style={{ color: "var(--accent-color)" }}>
                    {secondsToTimeString(liveElapsedSeconds(timer, now))}
                    {!timer.startedAt && " (paused)"}
                  </span>
                </Link>
                <button
                  className="btn btn-icon"
                  title="Stop"
                  onClick={() => stop(timer.taskId)}
                >
                  <Square size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
