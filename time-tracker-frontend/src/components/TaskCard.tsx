"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Badge, Box, Button, Group, Menu, Paper, Stack, Text, Tooltip } from "@mantine/core";
import {
  EllipsisVertical,
  GripVertical,
  ListTree,
  Pause,
  Pencil,
  Play,
  Plus,
  Square,
  Trash2,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { selectChildTasks } from "@/features/tasks/tasksSlice";
import { liveElapsedSeconds } from "@/features/timers/timersSlice";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useNowTick } from "@/lib/useNowTick";
import { computeLiveSubtreeSeconds } from "@/lib/subtreeTime";
import { getDescendantIds } from "@/lib/taskHierarchy";
import { secondsToTimeString } from "@/lib/time";
import { taskDndId } from "@/lib/dndIds";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  projectId: number;
  onDelete: (task: Task) => void;
  onOpenTask: (taskId: number) => void;
}

export function TaskCard({ task, projectId, onDelete, onOpenTask }: TaskCardProps) {
  const children = useAppSelector(selectChildTasks(task.id));
  const tasks = useAppSelector((state) => state.tasks.items);
  const running = useAppSelector((state) => state.timers.running);
  const now = useNowTick();
  const { start, pause, resume, stop } = useTaskTimerActions();

  const timer = running[task.id];
  const isRunning = Boolean(timer);
  const isPaused = isRunning && !timer?.startedAt;
  const currentSessionSeconds = liveElapsedSeconds(timer, now);
  const subtreeSeconds = computeLiveSubtreeSeconds(tasks, running, now, task.id);
  const descendantCount = children.length > 0 ? getDescendantIds(tasks, task.id).length : 0;
  const hasDescription = Boolean(task.description) && task.description !== "<p></p>";

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskDndId(task.id) });

  return (
    <Paper
      ref={setNodeRef}
      withBorder
      radius="md"
      p="sm"
      className="task-card"
      data-testid={`task-card-${task.id}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <Stack gap="xs">
        <Group gap={6} wrap="nowrap" align="flex-start">
          {/* Drag handle: only this area starts a drag, so the buttons get their clicks. */}
          <Group
            ref={setActivatorNodeRef}
            className="drag-handle"
            gap={4}
            wrap="nowrap"
            align="flex-start"
            style={{ flex: 1, minWidth: 0 }}
            {...listeners}
            {...attributes}
          >
            <Box c="gray.5" pt={2} style={{ flexShrink: 0, display: "flex" }}>
              <GripVertical size={16} />
            </Box>
            <Text
              fw={600}
              size="sm"
              lineClamp={2}
              style={{ cursor: "pointer", wordBreak: "break-word" }}
              onClick={() => onOpenTask(task.id)}
            >
              {task.name}
            </Text>
          </Group>

          <Menu position="bottom-end" shadow="md" width={180}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Task actions">
                <EllipsisVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Plus size={14} />}
                component={Link}
                href={`/projects/${projectId}/tasks/new?parentId=${task.id}`}
              >
                Add subtask
              </Menu.Item>
              <Menu.Item
                leftSection={<Pencil size={14} />}
                component={Link}
                href={`/projects/${projectId}/tasks/${task.id}/edit`}
              >
                Edit
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => onDelete(task)}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {hasDescription && (
          <Box
            className="rich-text"
            fz="xs"
            c="dimmed"
            style={{
              cursor: "pointer",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            onClick={() => onOpenTask(task.id)}
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
        )}

        {(children.length > 0 || isRunning) && (
          <Group gap="xs">
            {children.length > 0 && (
              <Button
                variant="light"
                size="compact-xs"
                leftSection={<ListTree size={12} />}
                onClick={() => onOpenTask(task.id)}
                data-testid={`expand-subtasks-${task.id}`}
              >
                {descendantCount} {descendantCount === 1 ? "subtask" : "subtasks"}
              </Button>
            )}
            {isRunning && (
              <Badge variant="light" color={isPaused ? "yellow" : "green"} size="sm">
                {isPaused ? "Paused" : "Running"}
              </Badge>
            )}
          </Group>
        )}

        <Group
          justify="space-between"
          wrap="nowrap"
          pt="xs"
          style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
        >
          <Stack gap={0}>
            {isRunning && (
              <Text size="xs" fw={600} c="blue.7" ff="monospace">
                Session {secondsToTimeString(currentSessionSeconds)}
              </Text>
            )}
            <Text size="xs" c="dimmed" ff="monospace">
              Total {secondsToTimeString(subtreeSeconds)}
            </Text>
          </Stack>
          <Group gap={6} wrap="nowrap">
            {!isRunning && (
              <Tooltip label="Start timer">
                <ActionIcon aria-label="Start timer" onClick={() => start(task, projectId)}>
                  <Play size={14} />
                </ActionIcon>
              </Tooltip>
            )}
            {isRunning && !isPaused && (
              <Tooltip label="Pause timer">
                <ActionIcon aria-label="Pause timer" onClick={() => pause(task.id)}>
                  <Pause size={14} />
                </ActionIcon>
              </Tooltip>
            )}
            {isPaused && (
              <Tooltip label="Resume timer">
                <ActionIcon aria-label="Resume timer" onClick={() => resume(task.id)}>
                  <Play size={14} />
                </ActionIcon>
              </Tooltip>
            )}
            {isRunning && (
              <Tooltip label="Stop timer">
                <ActionIcon aria-label="Stop timer" color="red" onClick={() => stop(task.id)}>
                  <Square size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
