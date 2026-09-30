"use client";

import { ActionIcon, Badge, Box, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
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
    <Stack gap="sm">
      {runningInProject.map((timer) => {
        const task = tasks.find((t) => t.id === timer.taskId);
        const currentSessionSeconds = liveElapsedSeconds(timer, now);
        const totalSeconds =
          (task ? timeStringToSeconds(task.timeTaken) : 0) + currentSessionSeconds;
        const paused = !timer.startedAt;

        return (
          <Paper
            key={timer.taskId}
            withBorder
            radius="md"
            p="md"
            style={{ borderColor: "var(--mantine-color-blue-4)", borderWidth: 2, cursor: "pointer" }}
            onClick={() => onOpenTask(timer.taskId)}
          >
            <Group justify="space-between" align="center" gap="lg">
              <Stack gap={4} style={{ flex: 1, minWidth: 200 }}>
                <Group gap="xs">
                  <Badge variant="light" color={paused ? "yellow" : "green"}>
                    {paused ? "Paused" : "Currently running"}
                  </Badge>
                </Group>
                <Text fw={700} size="lg" style={{ wordBreak: "break-word" }}>
                  {timer.taskName}
                </Text>
              </Stack>

              <Group gap="xl">
                <Box>
                  <Text size="xs" c="dimmed">
                    This session
                  </Text>
                  <Text fw={700} size="xl" ff="monospace" c="blue.7">
                    {secondsToTimeString(currentSessionSeconds)}
                  </Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">
                    Total tracked
                  </Text>
                  <Text fw={700} size="xl" ff="monospace">
                    {secondsToTimeString(totalSeconds)}
                  </Text>
                </Box>
              </Group>

              <Group gap="sm" onClick={(e) => e.stopPropagation()}>
                {paused ? (
                  <Tooltip label="Resume">
                    <ActionIcon size="lg" aria-label="Resume" onClick={() => resume(timer.taskId)}>
                      <Play size={16} />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Tooltip label="Pause">
                    <ActionIcon size="lg" aria-label="Pause" onClick={() => pause(timer.taskId)}>
                      <Pause size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Stop">
                  <ActionIcon size="lg" color="red" aria-label="Stop" onClick={() => stop(timer.taskId)}>
                    <Square size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}
