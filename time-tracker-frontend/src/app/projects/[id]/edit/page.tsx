"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProjects, updateProject } from "@/features/projects/projectsSlice";
import type { CreateProjectPayload } from "@/lib/types";
import { Container, Stack, Text, Title } from "@mantine/core";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { items: projects, loading: listLoading } = useAppSelector(
    (state) => state.projects
  );
  const project = projects.find((p) => p.id === projectId);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProjects());
    }
  }, [dispatch, project]);

  const handleSubmit = async (payload: CreateProjectPayload) => {
    setSubmitting(true);
    setError(null);
    const result = await dispatch(updateProject({ id: projectId, payload }));
    setSubmitting(false);
    if (updateProject.fulfilled.match(result)) {
      router.push(`/projects/${projectId}`);
    } else {
      setError((result.payload as string) ?? "Failed to update project");
    }
  };

  if (!project) {
    return (
      <Container size={760} py="xl">
        <Text c="dimmed">
          {listLoading ? "Loading project…" : "Project not found."}
        </Text>
      </Container>
    );
  }

  return (
    <Container size={760} py="xl">
      <Stack gap="lg">
        <Title order={1}>Edit Project</Title>
        <ProjectForm
          initialValues={{
            name: project.name,
            description: project.description,
            end: project.end ? project.end.slice(0, 10) : "",
          }}
          submitLabel="Save Changes"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/projects/${projectId}`)}
        />
      </Stack>
    </Container>
  );
}
