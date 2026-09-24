"use client";

import React, { useState } from "react";
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
    <form className="card flex-col gap-4" onSubmit={handleSubmit}>
      {error && <p style={{ color: "var(--danger-color)" }}>{error}</p>}

      <div className="flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="project-name">
          Name
        </label>
        <input
          id="project-name"
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex-col gap-2">
        <label className="text-sm font-medium">Description</label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe the project…"
        />
      </div>

      <div className="flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="project-end">
          End Date
        </label>
        <input
          id="project-end"
          type="date"
          className="input"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{ maxWidth: "220px" }}
        />
      </div>

      <div className="flex-row gap-2">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
