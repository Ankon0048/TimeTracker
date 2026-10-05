"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  Box,
  Button,
  Container,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
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
import { closeTask, openTask } from "@/features/ui/uiSlice";
import { BoardColumn } from "@/components/BoardColumn";
import { RunningTaskBanner } from "@/components/RunningTaskBanner";
import { TaskExplorerModal } from "@/components/TaskExplorerModal";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useErrorToast } from "@/lib/useErrorToast";
import { getDescendantIds } from "@/lib/taskHierarchy";
import { parseDndId } from "@/lib/dndIds";
import type { Task } from "@/lib/types";

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const dispatch = useAppDispatch();

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

  // The open popup is in the store so the header's running-tasks panel can
  // open it too; only show it when it belongs to this project.
  const openTaskRequest = useAppSelector((state) => state.ui.openTask);
  const openTaskId =
    openTaskRequest?.projectId === projectId ? openTaskRequest.taskId : null;
  const setOpenTaskId = (taskId: number | null) =>
    dispatch(taskId === null ? closeTask() : openTask({ taskId, projectId }));

  // A small drag distance means a plain click on a card never turns into a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const handleDeleteTask = (task: Task) => {
    const descendantCount = getDescendantIds(allTasks, task.id).length;
    modals.openConfirmModal({
      title: "Delete task",
      children: (
        <Text size="sm">
          Delete <b>{task.name}</b>
          {descendantCount > 0 &&
            ` and its ${descendantCount} ${descendantCount === 1 ? "subtask" : "subtasks"}`}
          ? This cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => dispatch(deleteTask(task.id)),
    });
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
    <Container fluid px={{ base: "md", sm: "xl" }} py="xl">
      <Stack gap="xl">
        <Box>
          <Button
            component={Link}
            href="/projects"
            variant="subtle"
            color="gray"
            leftSection={<ArrowLeft size={16} />}
            px="xs"
          >
            Back to projects
          </Button>
        </Box>

        {project ? (
          <Group justify="space-between" align="flex-start" gap="lg">
            <Stack gap={6} style={{ flex: 1, minWidth: 240 }}>
              <Title order={1} style={{ wordBreak: "break-word" }}>
                {project.name}
              </Title>
              {project.description && (
                <Box
                  className="rich-text"
                  c="dimmed"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
            </Stack>
            <Group gap="sm">
              <Button variant="default" component={Link} href={`/projects/${projectId}/edit`} leftSection={<Pencil size={16} />}>
                Edit project
              </Button>
              <Button component={Link} href={`/projects/${projectId}/tasks/new`} leftSection={<Plus size={16} />}>
                New task
              </Button>
            </Group>
          </Group>
        ) : (
          <Stack gap="xs">
            <Skeleton h={36} w={280} />
            <Skeleton h={16} w={200} />
          </Stack>
        )}

        <Paper withBorder radius="md" p="md" style={{ alignSelf: "flex-start", maxWidth: "100%" }}>
          <form onSubmit={handleAddState}>
            <Group gap="sm" align="flex-end">
              <TextInput
                label="Add a board column"
                placeholder="e.g. Code Review"
                value={newStateName}
                onChange={(e) => setNewStateName(e.currentTarget.value)}
                w={260}
                maw="100%"
              />
              <Button type="submit" variant="light" disabled={!newStateName.trim()} leftSection={<Plus size={16} />}>
                Add column
              </Button>
            </Group>
          </form>
        </Paper>

        <RunningTaskBanner projectId={projectId} onOpenTask={setOpenTaskId} />

        {(statesLoading && states.length === 0) || (tasksLoading && topLevelTasks.length === 0) ? (
          <Group align="flex-start" gap="lg" wrap="nowrap" style={{ overflow: "hidden" }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} h={260} w={340} radius="lg" style={{ flexShrink: 0 }} />
            ))}
          </Group>
        ) : states.length === 0 ? (
          <Paper withBorder radius="md" p="xl">
            <Text c="dimmed">
              No columns yet. Add one above (e.g. Pending, Ongoing, Completed), or create a task and a
              &quot;Pending&quot; column will be added for you.
            </Text>
          </Paper>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
          <Text c="dimmed">No tasks yet for this project.</Text>
        )}
      </Stack>

      <TaskExplorerModal
        key={openTaskId ?? "none"}
        taskId={openTaskId}
        projectId={projectId}
        onClose={() => setOpenTaskId(null)}
      />
    </Container>
  );
}
