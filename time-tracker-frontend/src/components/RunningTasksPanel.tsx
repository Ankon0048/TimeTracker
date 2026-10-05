"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ActionIcon,
  Group,
  Indicator,
  Popover,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { Bell, Pause, Play, Square } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { liveElapsedSeconds, selectRunningTimersList } from "@/features/timers/timersSlice";
import type { RunningTimer } from "@/features/timers/timersSlice";
import { openTask } from "@/features/ui/uiSlice";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useNowTick } from "@/lib/useNowTick";
import { secondsToTimeString } from "@/lib/time";

export function RunningTasksPanel() {
  const [opened, setOpened] = useState(false);
  const timers = useAppSelector(selectRunningTimersList);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { pause, resume, stop } = useTaskTimerActions();
  const now = useNowTick();

  // The task popup lives on the project board (it needs that project's
  // tasks), so go there first when viewing another page.
  const handleOpen = (timer: RunningTimer) => {
    setOpened(false);
    dispatch(openTask({ taskId: timer.taskId, projectId: timer.projectId }));
    const boardPath = `/projects/${timer.projectId}`;
    if (pathname !== boardPath) router.push(boardPath);
  };

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-end" width={340} shadow="md" withArrow>
      <Popover.Target>
        <Indicator
          label={timers.length}
          size={18}
          color="red"
          disabled={timers.length === 0}
          offset={4}
        >
          <ActionIcon
            size="lg"
            aria-label="Running tasks"
            onClick={() => setOpened((o) => !o)}
          >
            <Bell size={18} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="sm">
          <Text fw={700}>Running tasks</Text>
          {timers.length === 0 ? (
            <Text size="sm" c="dimmed">
              No tasks are currently running.
            </Text>
          ) : (
            timers.map((timer) => {
              const paused = !timer.startedAt;
              return (
                <Group key={timer.taskId} justify="space-between" wrap="nowrap" gap="sm">
                  <UnstyledButton onClick={() => handleOpen(timer)} style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {timer.taskName}
                    </Text>
                    <Text size="xs" c={paused ? "yellow.8" : "blue.7"} ff="monospace">
                      {secondsToTimeString(liveElapsedSeconds(timer, now))}
                      {paused && " (paused)"}
                    </Text>
                  </UnstyledButton>
                  <Group gap={6} wrap="nowrap">
                    {paused ? (
                      <Tooltip label="Resume timer">
                        <ActionIcon aria-label="Resume timer" onClick={() => resume(timer.taskId)}>
                          <Play size={14} />
                        </ActionIcon>
                      </Tooltip>
                    ) : (
                      <Tooltip label="Pause timer">
                        <ActionIcon aria-label="Pause timer" onClick={() => pause(timer.taskId)}>
                          <Pause size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip label="Stop timer">
                      <ActionIcon color="red" aria-label="Stop timer" onClick={() => stop(timer.taskId)}>
                        <Square size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              );
            })
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
