"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { deleteProject, fetchProjects } from "@/features/projects/projectsSlice";
import { useErrorToast } from "@/lib/useErrorToast";
import { CardSkeletonList } from "@/components/Skeleton";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { items: projects, loading, error } = useAppSelector(
    (state) => state.projects
  );

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useErrorToast(error);

  const handleDelete = (id: number, name: string) => {
    modals.openConfirmModal({
      title: "Delete project",
      children: (
        <Text size="sm">
          Delete project <b>{name}</b>? This cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => dispatch(deleteProject(id)),
    });
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Projects</Title>
          <Button component={Link} href="/projects/new" leftSection={<Plus size={16} />}>
            New project
          </Button>
        </Group>

        {loading && projects.length === 0 ? (
          <CardSkeletonList />
        ) : projects.length === 0 ? (
          <Paper withBorder radius="md" p="xl" ta="center">
            <Text c="dimmed">No projects yet. Create your first project to get started.</Text>
          </Paper>
        ) : (
          <Stack gap="md">
            {projects.map((project) => (
              <Paper key={project.id} withBorder radius="md" p="lg" className="task-card">
                <Group justify="space-between" wrap="nowrap" align="flex-start" gap="lg">
                  <Box
                    component={Link}
                    href={`/projects/${project.id}`}
                    style={{ flex: 1, minWidth: 0, textDecoration: "none", color: "inherit" }}
                  >
                    <Stack gap={6}>
                      <Text fw={600} size="lg" style={{ wordBreak: "break-word" }}>
                        {project.name}
                      </Text>
                      {project.description && project.description !== "<p></p>" ? (
                        <Box
                          className="rich-text"
                          fz="sm"
                          c="dimmed"
                          dangerouslySetInnerHTML={{ __html: project.description }}
                        />
                      ) : (
                        <Text size="sm" c="dimmed" fs="italic">
                          No description
                        </Text>
                      )}
                      <Group gap={6} c="dimmed">
                        <CalendarDays size={14} />
                        <Text size="xs">Created {new Date(project.start).toLocaleDateString()}</Text>
                      </Group>
                    </Stack>
                  </Box>
                  <Group gap="sm" wrap="nowrap">
                    <Tooltip label="Edit project">
                      <ActionIcon
                        size="lg"
                        component={Link}
                        href={`/projects/${project.id}/edit`}
                        aria-label="Edit project"
                      >
                        <Pencil size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete project">
                      <ActionIcon
                        size="lg"
                        color="red"
                        variant="light"
                        aria-label="Delete project"
                        onClick={() => handleDelete(project.id, project.name)}
                      >
                        <Trash2 size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
