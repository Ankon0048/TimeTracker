"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Bell, Square } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { liveElapsedSeconds, selectRunningTimersList } from "@/features/timers/timersSlice";
import { useTaskTimerActions } from "@/lib/useTaskTimer";
import { useNowTick } from "@/lib/useNowTick";
import { secondsToTimeString } from "@/lib/time";

export function RunningTasksPanel() {
  const [opened, setOpened] = useState(false);
  const timers = useAppSelector(selectRunningTimersList);
  const { stop } = useTaskTimerActions();
  const now = useNowTick();

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
            timers.map((timer) => (
              <Group key={timer.taskId} justify="space-between" wrap="nowrap" gap="sm">
                <UnstyledButton
                  component={Link}
                  href={`/projects/${timer.projectId}`}
                  onClick={() => setOpened(false)}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Text size="sm" fw={500} truncate>
                    {timer.taskName}
                  </Text>
                  <Text size="xs" c="blue.7" ff="monospace">
                    {secondsToTimeString(liveElapsedSeconds(timer, now))}
                    {!timer.startedAt && " (paused)"}
                  </Text>
                </UnstyledButton>
                <Tooltip label="Stop timer">
                  <ActionIcon color="red" aria-label="Stop timer" onClick={() => stop(timer.taskId)}>
                    <Square size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ))
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
