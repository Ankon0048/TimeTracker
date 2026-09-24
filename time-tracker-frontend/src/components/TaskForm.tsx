"use client";

import React, { useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
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

  const availableParents = parentOptions.filter(
    (task) => task.id !== excludeTaskId
  );

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
    <form className="card flex-col gap-4" onSubmit={handleSubmit}>
      {(error || formError) && (
        <p style={{ color: "var(--danger-color)" }}>{error ?? formError}</p>
      )}

      <div className="flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="task-name">
          Name
        </label>
        <input
          id="task-name"
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
          placeholder="Describe the task…"
        />
      </div>

      <div className="flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="task-parent">
          Parent Task
        </label>
        <select
          id="task-parent"
          className="select"
          value={parentID}
          onChange={(e) => setParentID(e.target.value)}
        >
          <option value="">None (top-level task)</option>
          {availableParents.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-row gap-4">
        <div className="flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="task-end">
            End Date
          </label>
          <input
            id="task-end"
            type="date"
            className="input"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div className="flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="task-time-taken">
            Time Taken (HH:MM:SS)
          </label>
          <input
            id="task-time-taken"
            type="text"
            className="input"
            value={timeTaken}
            onChange={(e) => setTimeTaken(e.target.value)}
            placeholder="00:00:00"
            style={{ maxWidth: "140px" }}
          />
        </div>
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
