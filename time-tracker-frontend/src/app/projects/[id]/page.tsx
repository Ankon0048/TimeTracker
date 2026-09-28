"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProjects } from "@/features/projects/projectsSlice";
import {
  deleteTask,
  fetchProjectTasks,
  reorderTasks,
  selectTopLevelTasks,
} from "@/features/tasks/tasksSlice";
import { createState, fetchStates } from "@/features/states/statesSlice";
import { BoardColumn } from "@/components/BoardColumn";
import { RunningTaskBanner } from "@/components/RunningTaskBanner";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useErrorToast } from "@/lib/useErrorToast";
import { CardSkeletonList } from "@/components/Skeleton";
import { parseDndId } from "@/lib/dndIds";

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { items: projects } = useAppSelector((state) => state.projects);
  const project = projects.find((p) => p.id === projectId);

  const topLevelTasks = useAppSelector(selectTopLevelTasks);
  const allTasks = useAppSelector((state) => state.tasks.items);
  const running = useAppSelector((state) => state.timers.running);
  const { loading: tasksLoading, error: tasksError } = useAppSelector(
    (state) => state.tasks
  );
  const { items: states, loading: statesLoading } = useAppSelector(
    (state) => state.states
  );

  const { start, stop, ongoingStateId } = useTaskTimerActions();

  const [newStateName, setNewStateName] = useState("");
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProjects());
    }
    dispatch(fetchProjectTasks(projectId));
    dispatch(fetchStates());
  }, [dispatch, projectId, project]);

  useErrorToast(tasksError);

  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim()) return;
    dispatch(createState(newStateName.trim()));
    setNewStateName("");
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask(taskId));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeParsed = parseDndId(active.id);
    const overParsed = parseDndId(over.id);
    if (!activeParsed || activeParsed.type !== "task" || !overParsed) return;

    const taskId = activeParsed.id;
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    const destStateId =
      overParsed.type === "column"
        ? overParsed.id
        : allTasks.find((t) => t.id === overParsed.id)?.stateID;
    if (destStateId === undefined) return;

    const destTasks = topLevelTasks.filter(
      (t) => t.stateID === destStateId && t.id !== taskId
    );
    let insertIndex = destTasks.length;
    if (overParsed.type === "task") {
      const idx = destTasks.findIndex((t) => t.id === overParsed.id);
      if (idx !== -1) insertIndex = idx;
    }
    const newIds = [
      ...destTasks.slice(0, insertIndex).map((t) => t.id),
      taskId,
      ...destTasks.slice(insertIndex).map((t) => t.id),
    ];

    const stateChanged = task.stateID !== destStateId;
    if (!stateChanged) {
      // Same column: skip the API call if the order didn't actually move.
      const currentIds = topLevelTasks
        .filter((t) => t.stateID === destStateId)
        .map((t) => t.id);
      if (currentIds.join(",") === newIds.join(",")) return;
    }

    dispatch(reorderTasks({ stateID: destStateId, taskIds: newIds }));

    // Dragging a task into "Ongoing" starts its timer; dragging a running
    // task out of "Ongoing" stops it. The reorder call above already
    // persisted the destination state, so these skip the redundant PATCH.
    if (stateChanged) {
      if (ongoingStateId && destStateId === ongoingStateId) {
        start(task, projectId, { syncState: false });
      } else if (running[taskId]) {
        stop(taskId, { syncState: false });
      }
    }
  };

  return (
    <div className="container-fluid">
      <button className="btn" style={{ alignSelf: "flex-start" }} onClick={() => router.push("/projects")}>
        <ArrowLeft size={16} />
        <span>Back to Projects</span>
      </button>

      {project ? (
        <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "1.5rem" }}>
          <div className="flex-col gap-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="text-muted" dangerouslySetInnerHTML={{ __html: project.description || "" }} />
          </div>
          <div className="flex-row gap-3">
            <Link href={`/projects/${projectId}/tasks/new`} className="btn btn-primary">
              <Plus size={16} />
              <span>New Task</span>
            </Link>
            <button className="btn" onClick={() => router.push(`/projects/${projectId}/edit`)}>
              <Pencil size={16} />
              <span>Edit</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted">Loading project…</p>
      )}

      <form
        className="flex-row gap-4 items-center card"
        onSubmit={handleAddState}
        style={{ padding: "1.25rem 1.75rem", alignSelf: "flex-start", flexWrap: "wrap" }}
      >
        <label className="font-semibold text-sm" style={{ whiteSpace: "nowrap" }}>
          Add State
        </label>
        <input
          type="text"
          className="input"
          value={newStateName}
          onChange={(e) => setNewStateName(e.target.value)}
          placeholder="e.g. Code Review"
          style={{ width: "260px" }}
        />
        <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
          Add State
        </button>
      </form>

      <RunningTaskBanner projectId={projectId} onOpenTask={setOpenTaskId} />

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
                onDelete={handleDeleteTask}
                onOpenTask={setOpenTaskId}
              />
            ))}
          </div>
        </DndContext>
      )}

      {!tasksLoading && topLevelTasks.length === 0 && states.length > 0 && (
        <p className="text-muted">No tasks yet for this project.</p>
      )}

      <TaskDetailModal
        key={openTaskId ?? "none"}
        taskId={openTaskId}
        projectId={projectId}
        onClose={() => setOpenTaskId(null)}
      />
    </div>
  );
}
