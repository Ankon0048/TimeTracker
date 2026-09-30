"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TaskForm } from "@/components/TaskForm";
import type { TaskFormValues } from "@/components/TaskForm";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProjectTasks, updateTask } from "@/features/tasks/tasksSlice";
import { Container, Stack, Text, Title } from "@mantine/core";

export default function EditTaskPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const projectId = Number(id);
  const taskIdNum = Number(taskId);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: tasks, loading } = useAppSelector((state) => state.tasks);
  const task = tasks.find((t) => t.id === taskIdNum);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      dispatch(fetchProjectTasks(projectId));
    }
  }, [dispatch, projectId, task]);

  const handleSubmit = async (values: TaskFormValues) => {
    setSubmitting(true);
    setError(null);
    const result = await dispatch(
      updateTask({
        id: taskIdNum,
        payload: {
          name: values.name,
          description: values.description,
          parentID: values.parentID,
          start: values.start,
          end: values.end,
          timeTaken: values.timeTaken,
        },
      })
    );
    setSubmitting(false);
    if (updateTask.fulfilled.match(result)) {
      router.push(`/projects/${projectId}`);
    } else {
      setError((result.payload as string) ?? "Failed to update task");
    }
  };

  if (!task) {
    return (
      <Container size={760} py="xl">
        <Text c="dimmed">{loading ? "Loading task…" : "Task not found."}</Text>
      </Container>
    );
  }

  return (
    <Container size={760} py="xl">
      <Stack gap="lg">
        <Title order={1}>Edit Task</Title>
        <TaskForm
          parentOptions={tasks}
          excludeTaskId={task.id}
          initialValues={{
            name: task.name,
            description: task.description,
            parentID: task.parentID,
            start: task.start,
            end: task.end,
            timeTaken: task.timeTaken,
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
