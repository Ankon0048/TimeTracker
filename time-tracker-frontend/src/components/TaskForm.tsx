"use client";

import React, { useState } from "react";
import { Alert, Button, Group, Input, NativeSelect, Paper, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { RichTextEditor } from "@/components/RichTextEditor";
import { getDescendantIds } from "@/lib/taskHierarchy";
import type { Task } from "@/lib/types";

export interface TaskFormValues {
  name: string;
  description: string;
  parentID: number | null;
  start: string; // ISO
  end: string | null; // ISO
  timeTaken: string; // HH:MM:SS
}

interface TaskFormProps {
  parentOptions: Task[];
  excludeTaskId?: number;
  initialValues?: Partial<TaskFormValues>;
  submitLabel: string;
  submitting: boolean;
  error?: string | null;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

const timeTakenPattern = /^([0-9]{1,3}):([0-5][0-9]):([0-5][0-9])$/;

export const TaskForm: React.FC<TaskFormProps> = ({
  parentOptions,
  excludeTaskId,
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [parentID, setParentID] = useState<string>(
    initialValues?.parentID != null ? String(initialValues.parentID) : ""
  );
  const [end, setEnd] = useState(
    initialValues?.end ? initialValues.end.slice(0, 10) : ""
  );
  const [timeTaken, setTimeTaken] = useState(
    initialValues?.timeTaken ?? "00:00:00"
  );
  const [formError, setFormError] = useState<string | null>(null);

  // A task can't become its own parent, nor a child of one of its own subtasks.
  const excluded = new Set(
    excludeTaskId != null ? [excludeTaskId, ...getDescendantIds(parentOptions, excludeTaskId)] : []
  );
  const availableParents = parentOptions.filter((task) => !excluded.has(task.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!timeTakenPattern.test(timeTaken)) {
      setFormError('Time taken must be in "HH:MM:SS" format.');
      return;
    }
    setFormError(null);
    onSubmit({
      name: name.trim(),
      description,
      parentID: parentID ? Number(parentID) : null,
      start: initialValues?.start ?? new Date().toISOString(),
      end: end ? new Date(end).toISOString() : null,
      timeTaken,
    });
  };

  return (
    <Paper withBorder radius="md" p="xl" component="form" onSubmit={handleSubmit}>
      <Stack gap="lg">
        {(error || formError) && (
          <Alert color="red" variant="light">
            {error ?? formError}
          </Alert>
        )}

        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <Input.Wrapper label="Description">
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Describe the task…"
          />
        </Input.Wrapper>

        <NativeSelect
          label="Parent task"
          value={parentID}
          onChange={(e) => setParentID(e.currentTarget.value)}
          data={[
            { value: "", label: "None (top-level task)" },
            ...availableParents.map((task) => ({ value: String(task.id), label: task.name })),
          ]}
        />

        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
          <TextInput
            label="End date"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.currentTarget.value)}
          />
          <TextInput
            label="Time taken (HH:MM:SS)"
            value={timeTaken}
            onChange={(e) => setTimeTaken(e.currentTarget.value)}
            placeholder="00:00:00"
            error={formError ? true : undefined}
          />
        </SimpleGrid>

        <Group gap="sm" pt="xs">
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};
