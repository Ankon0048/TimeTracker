"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Collapse,
  Divider,
  Flex,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  Tree,
  getTreeExpandedState,
  useTree,
} from "@mantine/core";
import type { TreeNodeData } from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ListTree,
  Pause,
  Pencil,
  Play,
  Plus,
  Save,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createTask, deleteTask, updateTask } from "@/features/tasks/tasksSlice";
import { liveElapsedSeconds } from "@/features/timers/timersSlice";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useNowTick } from "@/lib/useNowTick";
import { computeLiveSubtreeSeconds } from "@/lib/subtreeTime";
import { secondsToTimeString, timeStringToSeconds } from "@/lib/time";
import {
  buildTaskTree,
  getAncestorIds,
  getDescendantIds,
  getRootTaskId,
} from "@/lib/taskHierarchy";
import type { TaskTreeNode } from "@/lib/taskHierarchy";
import type { Task } from "@/lib/types";
import { RichTextEditor } from "@/components/RichTextEditor";

interface TaskExplorerModalProps {
  /** Task to show when the popup opens; null keeps the popup closed. */
  taskId: number | null;
  projectId: number;
  onClose: () => void;
}

const toTreeData = (node: TaskTreeNode): TreeNodeData => ({
  value: String(node.task.id),
  label: node.task.name,
  children: node.children.map(toTreeData),
});

/**
 * Popup for a task's whole tree: the nested hierarchy on the left, the
 * selected task's details (with edit / delete / subtask / timer actions) on
 * the right. Mount with a `key` per opened task so selection state resets.
 */
export function TaskExplorerModal({ taskId, projectId, onClose }: TaskExplorerModalProps) {
  const tasks = useAppSelector((state) => state.tasks.items);
  const [selectedId, setSelectedId] = useState<number | null>(taskId);

  const rootId = selectedId != null ? getRootTaskId(tasks, selectedId) : null;
  const treeRoot = useMemo(
    () => (rootId != null ? buildTaskTree(tasks, rootId) : null),
    [tasks, rootId]
  );
  const treeData = useMemo(() => (treeRoot ? [toTreeData(treeRoot)] : []), [treeRoot]);

  const tree = useTree({ initialExpandedState: getTreeExpandedState(treeData, "*") });

  const selectedTask = tasks.find((t) => t.id === selectedId);
  const opened = taskId != null && selectedTask != null && treeRoot != null;

  const subtaskCount = treeRoot ? getDescendantIds(tasks, treeRoot.task.id).length : 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="72rem"
      padding="lg"
      title={
        <Group gap="xs" wrap="nowrap">
          <ListTree size={18} />
          <Text fw={700} size="lg" lineClamp={1}>
            {treeRoot?.task.name}
          </Text>
          <Badge variant="light" color="gray" style={{ flexShrink: 0 }}>
            {subtaskCount} {subtaskCount === 1 ? "subtask" : "subtasks"}
          </Badge>
        </Group>
      }
    >
      {opened && (
        <Flex direction={{ base: "column", sm: "row" }} gap="lg" align="stretch">
          <Paper
            withBorder
            radius="md"
            p="xs"
            w={{ base: "100%", sm: 320 }}
            style={{ flexShrink: 0 }}
          >
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" px={6} pb={6}>
              Task tree
            </Text>
            <Box mah="65vh" style={{ overflowY: "auto", overflowX: "hidden" }}>
              <Tree
                data={treeData}
                tree={tree}
                levelOffset="md"
                expandOnClick={false}
                withLines
                renderNode={({ node, expanded, hasChildren, elementProps }) => {
                  const id = Number(node.value);
                  const nodeTask = tasks.find((t) => t.id === id);
                  return (
                    <Group
                      {...elementProps}
                      className={`${elementProps.className} task-tree-node`}
                      // Mantine styles on the attribute's presence, so omit it when unselected.
                      data-selected={id === selectedId || undefined}
                      data-testid={`tree-node-${id}`}
                      gap={4}
                      wrap="nowrap"
                      onClick={(e) => {
                        elementProps.onClick(e);
                        setSelectedId(id);
                      }}
                    >
                      {hasChildren ? (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          aria-label={expanded ? "Collapse" : "Expand"}
                          onClick={(e) => {
                            e.stopPropagation();
                            tree.toggleExpanded(node.value);
                          }}
                        >
                          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </ActionIcon>
                      ) : (
                        <Box w={22} style={{ flexShrink: 0 }} />
                      )}
                      <Text size="sm" fw={id === selectedId ? 600 : 400} truncate style={{ flex: 1, minWidth: 0 }} title={String(node.label)}>
                        {node.label}
                      </Text>
                      {nodeTask && <TreeNodeTime task={nodeTask} />}
                    </Group>
                  );
                }}
              />
            </Box>
          </Paper>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <TaskDetailsPane
              key={selectedTask.id}
              task={selectedTask}
              projectId={projectId}
              onSelect={setSelectedId}
              onSubtaskCreated={(parentId, newId) => {
                tree.expand(String(parentId));
                setSelectedId(newId);
              }}
              onDeleted={(parentId) => {
                if (parentId == null) onClose();
                else setSelectedId(parentId);
              }}
            />
          </Box>
        </Flex>
      )}
    </Modal>
  );
}

function TreeNodeTime({ task }: { task: Task }) {
  const tasks = useAppSelector((state) => state.tasks.items);
  const running = useAppSelector((state) => state.timers.running);
  const now = useNowTick();
  const isRunning = Boolean(running[task.id]);
  const total = computeLiveSubtreeSeconds(tasks, running, now, task.id);
  return (
    <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
      {isRunning && (
        <Box
          w={8}
          h={8}
          bg="green.6"
          style={{ borderRadius: "50%" }}
          aria-label="Running"
        />
      )}
      <Text size="xs" c="dimmed" ff="monospace">
        {secondsToTimeString(total)}
      </Text>
    </Group>
  );
}

interface TaskDetailsPaneProps {
  task: Task;
  projectId: number;
  onSelect: (taskId: number) => void;
  onSubtaskCreated: (parentId: number, newTaskId: number) => void;
  onDeleted: (parentId: number | null) => void;
}

function TaskDetailsPane({
  task,
  projectId,
  onSelect,
  onSubtaskCreated,
  onDeleted,
}: TaskDetailsPaneProps) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const states = useAppSelector((state) => state.states.items);
  const running = useAppSelector((state) => state.timers.running);
  const timer = running[task.id];
  const { start, pause, resume, stop } = useTaskTimerActions();
  const now = useNowTick();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [saving, setSaving] = useState(false);

  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskName, setSubtaskName] = useState("");
  const [creatingSubtask, setCreatingSubtask] = useState(false);

  const isRunning = Boolean(timer);
  const isPaused = isRunning && !timer?.startedAt;
  const stateName = states.find((s) => s.id === task.stateID)?.name;
  const sessionSeconds = liveElapsedSeconds(timer, now);
  const ownSeconds = timeStringToSeconds(task.timeTaken) + sessionSeconds;
  const subtreeSeconds = computeLiveSubtreeSeconds(tasks, running, now, task.id);

  const ancestors = getAncestorIds(tasks, task.id)
    .reverse()
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t));

  const handleSave = async () => {
    setSaving(true);
    const result = await dispatch(
      updateTask({
        id: task.id,
        payload: { name: name.trim() || task.name, description },
      })
    );
    setSaving(false);
    if (updateTask.fulfilled.match(result)) setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setName(task.name);
    setDescription(task.description);
    setIsEditing(false);
  };

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskName.trim()) return;
    setCreatingSubtask(true);
    const result = await dispatch(
      createTask({
        parentID: task.id,
        projectID: projectId,
        name: subtaskName.trim(),
        description: "",
        start: new Date().toISOString(),
        end: null,
        timeTaken: "00:00:00",
      })
    );
    setCreatingSubtask(false);
    if (createTask.fulfilled.match(result)) {
      setSubtaskName("");
      setAddingSubtask(false);
      onSubtaskCreated(task.id, result.payload.id);
    }
  };

  const handleDelete = () => {
    const descendantCount = getDescendantIds(tasks, task.id).length;
    modals.openConfirmModal({
      title: "Delete task",
      centered: true,
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
      onConfirm: async () => {
        const parentId = task.parentID;
        const result = await dispatch(deleteTask(task.id));
        if (deleteTask.fulfilled.match(result)) onDeleted(parentId);
      },
    });
  };

  return (
    <Stack gap="lg">
      {ancestors.length > 0 && (
        <Breadcrumbs separator="›" separatorMargin={6} style={{ flexWrap: "wrap" }}>
          {ancestors.map((a) => (
            <Anchor key={a.id} size="sm" component="button" type="button" onClick={() => onSelect(a.id)}>
              {a.name}
            </Anchor>
          ))}
          <Text size="sm" c="dimmed">
            {task.name}
          </Text>
        </Breadcrumbs>
      )}

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Task name
        </Text>
        {isEditing ? (
          <TextInput
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            aria-label="Task name"
            data-autofocus
          />
        ) : (
          <Group gap="xs" align="center">
            <Title order={3} style={{ wordBreak: "break-word" }}>
              {task.name}
            </Title>
            {stateName && (
              <Badge variant="light" color="gray">
                {stateName}
              </Badge>
            )}
            {isRunning && (
              <Badge variant="light" color={isPaused ? "yellow" : "green"}>
                {isPaused ? "Paused" : "Running"}
              </Badge>
            )}
          </Group>
        )}
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Description
        </Text>
        {isEditing ? (
          <RichTextEditor value={description} onChange={setDescription} />
        ) : task.description && task.description !== "<p></p>" ? (
          <Box
            className="rich-text"
            fz="sm"
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            No description
          </Text>
        )}
      </Stack>

      <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm">
        <TimeStat label="This session" value={sessionSeconds} highlight={isRunning} />
        <TimeStat label="Task time" value={ownSeconds} />
        <TimeStat label="Total incl. subtasks" value={subtreeSeconds} />
      </SimpleGrid>

      <Divider />

      {isEditing ? (
        <Group gap="sm" justify="flex-end">
          <Button variant="default" leftSection={<X size={16} />} onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button leftSection={<Save size={16} />} loading={saving} onClick={handleSave}>
            Save changes
          </Button>
        </Group>
      ) : (
        <Group justify="space-between" gap="sm">
          <Group gap="sm">
            {!isRunning && (
              <Button leftSection={<Play size={16} />} onClick={() => start(task, projectId)}>
                Start timer
              </Button>
            )}
            {isRunning && !isPaused && (
              <Button variant="light" leftSection={<Pause size={16} />} onClick={() => pause(task.id)}>
                Pause
              </Button>
            )}
            {isPaused && (
              <Button variant="light" leftSection={<Play size={16} />} onClick={() => resume(task.id)}>
                Resume
              </Button>
            )}
            {isRunning && (
              <Button variant="light" color="red" leftSection={<Square size={16} />} onClick={() => stop(task.id)}>
                Stop
              </Button>
            )}
          </Group>

          <Group gap="sm">
            <Button
              variant="default"
              leftSection={<Plus size={16} />}
              onClick={() => setAddingSubtask((v) => !v)}
            >
              Add subtask
            </Button>
            <Button variant="default" leftSection={<Pencil size={16} />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Tooltip label="Open full editor (parent, end date, time)">
              <ActionIcon
                size="lg"
                component={Link}
                href={`/projects/${projectId}/tasks/${task.id}/edit`}
                aria-label="Open full editor"
              >
                <ExternalLink size={16} />
              </ActionIcon>
            </Tooltip>
            <Button variant="light" color="red" leftSection={<Trash2 size={16} />} onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Group>
      )}

      <Collapse expanded={addingSubtask && !isEditing}>
        <form onSubmit={handleCreateSubtask}>
          <Group gap="sm" align="flex-end">
            <TextInput
              style={{ flex: 1 }}
              label={`New subtask of "${task.name}"`}
              placeholder="Subtask name"
              value={subtaskName}
              onChange={(e) => setSubtaskName(e.currentTarget.value)}
            />
            <Button type="submit" loading={creatingSubtask} disabled={!subtaskName.trim()}>
              Create
            </Button>
          </Group>
        </form>
      </Collapse>
    </Stack>
  );
}

function TimeStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Paper withBorder radius="md" p="sm" bg={highlight ? "blue.0" : undefined}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={700} size="lg" ff="monospace" c={highlight ? "blue.7" : undefined}>
        {secondsToTimeString(value)}
      </Text>
    </Paper>
  );
}
