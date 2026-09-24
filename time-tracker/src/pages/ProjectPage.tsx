import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { api } from "../services/api";
import type { Project, State, Task } from "../services/api";
import { useToast } from "../context/ToastContext";
import { BoardColumn } from "../components/BoardColumn";
import { TaskModal } from "../components/TaskModal";
import { TaskViewModal } from "../components/TaskViewModal";
import {
  timeStringToSeconds,
  secondsToTimeString,
  formatStopwatch,
} from "../utils/time";
import { Play, Pause, Square } from "lucide-react";

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [newStateName, setNewStateName] = useState("");

  // Running task state
  const [runningTaskId, setRunningTaskId] = useState<number | null>(null);
  const [runningTaskState, setRunningTaskState] = useState<
    "ongoing" | "paused" | null
  >(null);
  const [runningTaskStartTime, setRunningTaskStartTime] = useState<
    number | null
  >(null);
  const [runningTaskElapsedTime, setRunningTaskElapsedTime] =
    useState<number>(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState<number | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);

  // This ref keeps track of accumulated time before the current "start/resume"
  // so we don't lose time when pausing/resuming.
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (projectId) {
      loadData(Number(projectId));
    }
  }, [projectId]);

  // Recursively fetches all tasks (parents + nested) for a project into a flat array
  const fetchAllTasks = async (projectId: number): Promise<Task[]> => {
    const parentTasks = await api.getParentTasks(projectId);
    const allTasks: Task[] = [...parentTasks];

    const fetchNested = async (parentId: number) => {
      const nested = await api.getNestedTasks(parentId);
      for (const child of nested) {
        allTasks.push(child);
        await fetchNested(child.id);
      }
    };

    await Promise.all(parentTasks.map((t) => fetchNested(t.id)));
    return allTasks;
  };

  const loadData = async (id: number) => {
    try {
      const [proj, stts, allTasks] = await Promise.all([
        api.getProjects().then((res) => res.find((p) => p.id === id) || null),
        api.getStates(),
        fetchAllTasks(id),
      ]);

      setProject(proj);
      setStates(stts);
      setTasks(allTasks);
    } catch (e) {
      console.error(e);
      showToast("Failed to load project data");
    }
  };

  // Identify special states
  const ongoingState = states.find((s) => s.name.toLowerCase() === "ongoing");
  const pendingState = states.find((s) => s.name.toLowerCase() === "pending");
  const completedState = states.find(
    (s) => s.name.toLowerCase() === "completed"
  );

  const ongoingStateId = ongoingState?.id ?? null;
  const pendingStateId = pendingState?.id ?? null;
  const completedStateId = completedState?.id ?? null;

  // Stopwatch effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (
      runningTaskId &&
      runningTaskState === "ongoing" &&
      runningTaskStartTime
    ) {
      interval = setInterval(() => {
        const now = Date.now();
        const diffInSeconds = Math.floor((now - runningTaskStartTime) / 1000);
        setRunningTaskElapsedTime(accumulatedTimeRef.current + diffInSeconds);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [runningTaskId, runningTaskState, runningTaskStartTime]);

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName) return;
    try {
      const state = await api.createState(newStateName);
      setStates([...states, state]);
      setNewStateName("");
    } catch (e) {
      console.error(e);
      showToast("Failed to add state");
    }
  };

  const startTask = async (taskId: number, skipStateUpdate = false) => {
    if (runningTaskId && runningTaskId !== taskId) {
      showToast("A task is already running — stop it before starting another.");
      return false;
    }

    if (!skipStateUpdate && ongoingStateId) {
      try {
        await api.updateTask(taskId, { stateID: ongoingStateId });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, stateID: ongoingStateId } : t
          )
        );
      } catch (e) {
        console.error(e);
        showToast("Failed to update task state");
        return false;
      }
    }

    if (runningTaskId !== taskId) {
      setRunningTaskId(taskId);
      accumulatedTimeRef.current = 0;
      setRunningTaskElapsedTime(0);
    }
    setRunningTaskState("ongoing");
    setRunningTaskStartTime(Date.now());
    return true;
  };

  const resumeTask = async (taskId: number) => {
    if (runningTaskId !== taskId) return false;
    setRunningTaskState("ongoing");
    setRunningTaskStartTime(Date.now());
    return true;
  };

  const pauseTask = async (taskId: number) => {
    if (runningTaskId !== taskId) return;
    if (runningTaskStartTime) {
      accumulatedTimeRef.current += Math.floor(
        (Date.now() - runningTaskStartTime) / 1000
      );
    }
    setRunningTaskState("paused");
    setRunningTaskStartTime(null);
  };

  const stopTask = async (taskId: number) => {
    if (runningTaskId !== taskId) return;

    let finalElapsed = accumulatedTimeRef.current;
    if (runningTaskState === "ongoing" && runningTaskStartTime) {
      finalElapsed += Math.floor((Date.now() - runningTaskStartTime) / 1000);
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task && completedStateId) {
      const currentBaseSeconds = timeStringToSeconds(task.timeTaken);
      const newTotalSeconds = currentBaseSeconds + finalElapsed;
      const newTimeTaken = secondsToTimeString(newTotalSeconds);

      // Use UTC ISO string — PostgreSQL 'timestamp with time zone' requires UTC
      const endTime = new Date().toISOString();

      try {
        console.log(completedStateId);
        const updatedTask = await api.updateTask(taskId, {
          stateID: completedStateId,
          timeTaken: newTimeTaken,
          end: endTime,
          start: task.start,
          parentID: task.parentID,
          name: task.name,
          description: task.description,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
      } catch (e) {
        console.error(e);
        showToast("Failed to complete task");
      }
    }

    setRunningTaskId(null);
    setRunningTaskState(null);
    setRunningTaskStartTime(null);
    setRunningTaskElapsedTime(0);
    accumulatedTimeRef.current = 0;
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      return;
    }

    const taskId = Number(draggableId);
    const destStateId = Number(destination.droppableId);

    if (destStateId === ongoingStateId) {
      const success = await startTask(taskId, true);
      if (!success) return;
    }

    try {
      await api.updateTask(taskId, { stateID: destStateId });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, stateID: destStateId } : t))
      );
    } catch (e) {
      console.error(e);
      showToast("Failed to move task");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.deleteTask(taskId);
        if (projectId) {
          loadData(Number(projectId));
        }
      } catch (e) {
        console.error(e);
        showToast("Failed to delete task");
      }
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    setIsModalOpen(false);
  };

  if (!project) {
    return <div className="container">Loading project...</div>;
  }

  const topLevelTasks = tasks.filter((t) => t.parentID === null);
  const runningTask = runningTaskId
    ? tasks.find((t) => t.id === runningTaskId)
    : null;

  return (
    <div
      className="container flex-col gap-6"
      style={{ maxWidth: "100%", minHeight: "100vh", paddingBottom: "0" }}
    >
      <div className="flex-row justify-between items-center">
        <div className="flex-col">
          <button
            className="btn"
            style={{ alignSelf: "flex-start", marginBottom: "1rem" }}
            onClick={() => navigate("/")}
          >
            Back to Homepage
          </button>
          <h1>{project.name}</h1>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: project.description || '' }} />
        </div>
        <div className="text-sm text-muted">
          Created: {new Date(project.start).toLocaleDateString()}
        </div>
      </div>

      <form
        className="flex-row gap-4 items-center card"
        onSubmit={handleAddState}
        style={{ padding: "1rem 1.5rem" }}
      >
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

      <div className="card">
        <h3 style={{ marginBottom: "1rem" }}>Currently Running Task</h3>
        {runningTask ? (
          <div
            className="flex-row justify-between items-center"
            style={{
              padding: "1rem",
              backgroundColor: "#eff6ff",
              borderRadius: "var(--radius-md)",
              border: "1px solid #bfdbfe",
            }}
          >
            <div className="flex-col">
              <span className="font-bold">{runningTask.name}</span>
              <span
                className="text-sm text-muted"
                dangerouslySetInnerHTML={{ __html: runningTask.description || '' }}
              />
            </div>
            <div className="flex-row gap-6 items-center">
              <div className="flex-col items-end">
                <span className="text-xs text-muted">Time Elapsed</span>
                <span
                  className="font-bold text-accent"
                  style={{ color: "var(--accent-color)" }}
                >
                  {formatStopwatch(runningTaskElapsedTime)}
                </span>
              </div>
              <div className="flex-row gap-2">
                <button
                  className="btn btn-icon"
                  onClick={() =>
                    runningTaskState === "paused"
                      ? resumeTask(runningTask.id)
                      : pauseTask(runningTask.id)
                  }
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
                  onClick={() => stopTask(runningTask.id)}
                  title="Stop"
                >
                  <Square size={10} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted" style={{ margin: 0 }}>
            No task is running currently.
          </p>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board">
          {states.map((state) => {
            const stateTasks = topLevelTasks.filter(
              (t) => t.stateID === state.id
            );
            return (
              <BoardColumn
                key={state.id}
                state={state}
                tasks={stateTasks}
                allTasks={tasks}
                ongoingStateId={ongoingStateId}
                pendingStateId={pendingStateId}
                completedStateId={completedStateId}
                runningTaskId={runningTaskId}
                runningTaskState={runningTaskState}
                runningTaskElapsedTime={runningTaskElapsedTime}
                onStart={startTask}
                onPause={pauseTask}
                onResume={resumeTask}
                onStop={stopTask}
                onOpenModal={(parentId) => {
                  setModalParentId(parentId);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onViewTask={(task) => setViewTask(task)}
              />
            );
          })}
        </div>
      </DragDropContext>

      {project && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          parentId={modalParentId}
          projectId={project.id}
          onSuccess={handleTaskCreated}
        />
      )}

      <TaskViewModal
        task={viewTask}
        isOpen={!!viewTask}
        onClose={() => setViewTask(null)}
        onUpdate={(updatedTask) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
          setViewTask(updatedTask);
        }}
      />
    </div>
  );
};
