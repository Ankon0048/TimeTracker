"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TaskForm } from "@/components/TaskForm";
import type { TaskFormValues } from "@/components/TaskForm";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createTask, fetchProjectTasks } from "@/features/tasks/tasksSlice";
import { Container, Stack, Title } from "@mantine/core";

export default function NewTaskPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const searchParams = useSearchParams();
  const parentIdParam = searchParams.get("parentId");

  const dispatch = useAppDispatch();
  const router = useRouter();
  const tasks = useAppSelector((state) => state.tasks.items);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tasks.length === 0) {
      dispatch(fetchProjectTasks(projectId));
    }
  }, [dispatch, projectId, tasks.length]);

  const handleSubmit = async (values: TaskFormValues) => {
    setSubmitting(true);
    setError(null);
    const result = await dispatch(
      createTask({
        parentID: values.parentID,
        projectID: projectId,
        name: values.name,
        description: values.description,
        start: values.start,
        end: values.end,
        timeTaken: values.timeTaken,
      })
    );
    setSubmitting(false);
    if (createTask.fulfilled.match(result)) {
      router.push(`/projects/${projectId}`);
    } else {
      setError((result.payload as string) ?? "Failed to create task");
    }
  };

  return (
    <Container size={760} py="xl">
      <Stack gap="lg">
        <Title order={1}>New Task</Title>
        <TaskForm
          parentOptions={tasks}
          initialValues={
            parentIdParam ? { parentID: Number(parentIdParam) } : undefined
          }
          submitLabel="Create Task"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/projects/${projectId}`)}
        />
      </Stack>
    </Container>
  );
}
