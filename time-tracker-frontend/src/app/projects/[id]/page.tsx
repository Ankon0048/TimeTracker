"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProjects } from "@/features/projects/projectsSlice";
import { deleteTask, fetchProjectTasks, selectTopLevelTasks, updateTask } from "@/features/tasks/tasksSlice";
import { createState, fetchStates } from "@/features/states/statesSlice";
import { BoardColumn } from "@/components/BoardColumn";
import { secondsToTimeString, timeStringToSeconds } from "@/lib/time";
import { useToast } from "@/context/ToastContext";
import { useErrorToast } from "@/lib/useErrorToast";
import { CardSkeletonList } from "@/components/Skeleton";

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();

  const { items: projects } = useAppSelector((state) => state.projects);
  const project = projects.find((p) => p.id === projectId);

  const topLevelTasks = useAppSelector(selectTopLevelTasks);
  const allTasks = useAppSelector((state) => state.tasks.items);
  const { loading: tasksLoading, error: tasksError } = useAppSelector(
    (state) => state.tasks
  );
  const { items: states, loading: statesLoading } = useAppSelector(
    (state) => state.states
  );

  const [newStateName, setNewStateName] = useState("");

  const [runningTaskId, setRunningTaskId] = useState<number | null>(null);
  const [runningTaskState, setRunningTaskState] = useState<
    "ongoing" | "paused" | null
  >(null);
  const [runningTaskStartTime, setRunningTaskStartTime] = useState<
    number | null
  >(null);
  const [runningTaskElapsedTime, setRunningTaskElapsedTime] = useState(0);
  const accumulatedTimeRef = useRef(0);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProjects());
    }
    dispatch(fetchProjectTasks(projectId));
    dispatch(fetchStates());
  }, [dispatch, projectId, project]);

  useErrorToast(tasksError);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (runningTaskId && runningTaskState === "ongoing" && runningTaskStartTime) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - runningTaskStartTime) / 1000);
        setRunningTaskElapsedTime(accumulatedTimeRef.current + diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [runningTaskId, runningTaskState, runningTaskStartTime]);

  const ongoingStateId =
    states.find((s) => s.name.toLowerCase() === "ongoing")?.id ?? null;
  const completedStateId =
    states.find((s) => s.name.toLowerCase() === "completed")?.id ?? null;

  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim()) return;
    dispatch(createState(newStateName.trim()));
    setNewStateName("");
  };

  const startTask = (taskId: number) => {
    if (runningTaskId && runningTaskId !== taskId) {
      showToast("A task is already running — stop it before starting another.", "error");
      return;
    }
    if (ongoingStateId) {
      dispatch(updateTask({ id: taskId, payload: { stateID: ongoingStateId } }));
    }
    setRunningTaskId(taskId);
    accumulatedTimeRef.current = 0;
    setRunningTaskElapsedTime(0);
    setRunningTaskState("ongoing");
    setRunningTaskStartTime(Date.now());
  };

  const pauseTask = (taskId: number) => {
    if (runningTaskId !== taskId || !runningTaskStartTime) return;
    accumulatedTimeRef.current += Math.floor(
      (Date.now() - runningTaskStartTime) / 1000
    );
    setRunningTaskState("paused");
    setRunningTaskStartTime(null);
  };

  const resumeTask = (taskId: number) => {
    if (runningTaskId !== taskId) return;
    setRunningTaskState("ongoing");
    setRunningTaskStartTime(Date.now());
  };

  const stopTask = (taskId: number) => {
    if (runningTaskId !== taskId) return;

    let finalElapsed = accumulatedTimeRef.current;
    if (runningTaskState === "ongoing" && runningTaskStartTime) {
      finalElapsed += Math.floor((Date.now() - runningTaskStartTime) / 1000);
    }

    const task = allTasks.find((t) => t.id === taskId);
    if (task) {
      const newTotalSeconds = timeStringToSeconds(task.timeTaken) + finalElapsed;
      dispatch(
        updateTask({
          id: taskId,
          payload: {
            timeTaken: secondsToTimeString(newTotalSeconds),
            end: new Date().toISOString(),
            ...(completedStateId ? { stateID: completedStateId } : {}),
          },
        })
      );
    }

    setRunningTaskId(null);
    setRunningTaskState(null);
    setRunningTaskStartTime(null);
    setRunningTaskElapsedTime(0);
    accumulatedTimeRef.current = 0;
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask(taskId));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const destStateId = Number(over.id);
    const task = allTasks.find((t) => t.id === taskId);
    if (!task || task.stateID === destStateId) return;

    dispatch(updateTask({ id: taskId, payload: { stateID: destStateId } }));
  };

  return (
    <div className="container flex-col gap-6" style={{ maxWidth: "100%" }}>
      <button className="btn" style={{ alignSelf: "flex-start" }} onClick={() => router.push("/projects")}>
        <ArrowLeft size={16} style={{ marginRight: "0.375rem" }} />
        Back to Projects
      </button>

      {project ? (
        <div className="flex-row justify-between items-center">
          <div className="flex-col gap-2">
            <h1>{project.name}</h1>
            <p className="text-muted" dangerouslySetInnerHTML={{ __html: project.description || "" }} />
          </div>
          <div className="flex-row gap-2">
            <Link href={`/projects/${projectId}/tasks/new`} className="btn btn-primary">
              <Plus size={16} style={{ marginRight: "0.375rem" }} />
              New Task
            </Link>
            <button className="btn" onClick={() => router.push(`/projects/${projectId}/edit`)}>
              <Pencil size={16} style={{ marginRight: "0.375rem" }} />
              Edit
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted">Loading project…</p>
      )}

      <form className="flex-row gap-4 items-center card" onSubmit={handleAddState} style={{ padding: "1rem 1.5rem" }}>
        <label className="font-medium text-sm">State Name</label>
        <input
          type="text"
          className="input"
          value={newStateName}
          onChange={(e) => setNewStateName(e.target.value)}
          placeholder="e.g. In Progress"
        />
        <button type="submit" className="btn btn-primary">
          Add State
        </button>
      </form>

      {(statesLoading && states.length === 0) || (tasksLoading && topLevelTasks.length === 0) ? (
        <CardSkeletonList />
      ) : states.length === 0 ? (
        <div className="card">
          <p className="text-muted">
            No states yet. Add a state above (e.g. Pending, Ongoing, Completed) to start the board.
          </p>
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="board">
            {states.map((state) => (
              <BoardColumn
                key={state.id}
                state={state}
                tasks={topLevelTasks.filter((t) => t.stateID === state.id)}
                projectId={projectId}
                runningTaskId={runningTaskId}
                runningTaskState={runningTaskState}
                runningTaskElapsedTime={runningTaskElapsedTime}
                onStart={startTask}
                onPause={pauseTask}
                onResume={resumeTask}
                onStop={stopTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </DndContext>
      )}

      {!tasksLoading && topLevelTasks.length === 0 && states.length > 0 && (
        <p className="text-muted">No tasks yet for this project.</p>
      )}
    </div>
  );
}
