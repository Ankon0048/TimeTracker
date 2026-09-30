"use client";

import React, { useState } from "react";
import { Alert, Button, Group, Input, Paper, Stack, TextInput } from "@mantine/core";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { CreateProjectPayload } from "@/lib/types";

interface ProjectFormProps {
  initialValues?: {
    name: string;
    description: string;
    end: string; // yyyy-mm-dd, for the date input
  };
  submitLabel: string;
  submitting: boolean;
  error?: string | null;
  onSubmit: (payload: CreateProjectPayload) => void;
  onCancel: () => void;
}

const defaultEnd = () =>
  new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 10);

export const ProjectForm: React.FC<ProjectFormProps> = ({
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
  const [end, setEnd] = useState(initialValues?.end ?? defaultEnd());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description,
      end: new Date(end).toISOString(),
    });
  };

  return (
    <Paper withBorder radius="md" p="xl" component="form" onSubmit={handleSubmit}>
      <Stack gap="lg">
        {error && (
          <Alert color="red" variant="light">
            {error}
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
            placeholder="Describe the project…"
          />
        </Input.Wrapper>

        <TextInput
          label="End date"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.currentTarget.value)}
          w={220}
          maw="100%"
        />

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
