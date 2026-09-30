"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { useAppDispatch } from "@/lib/hooks";
import { createProject } from "@/features/projects/projectsSlice";
import type { CreateProjectPayload } from "@/lib/types";
import { Container, Stack, Title } from "@mantine/core";

export default function NewProjectPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: CreateProjectPayload) => {
    setSubmitting(true);
    setError(null);
    const result = await dispatch(createProject(payload));
    setSubmitting(false);
    if (createProject.fulfilled.match(result)) {
      router.push(`/projects/${result.payload.id}`);
    } else {
      setError((result.payload as string) ?? "Failed to create project");
    }
  };

  return (
    <Container size={760} py="xl">
      <Stack gap="lg">
        <Title order={1}>New Project</Title>
        <ProjectForm
          submitLabel="Create Project"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/projects")}
        />
      </Stack>
    </Container>
  );
}
