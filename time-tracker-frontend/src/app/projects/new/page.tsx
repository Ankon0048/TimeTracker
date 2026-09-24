"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { useAppDispatch } from "@/lib/hooks";
import { createProject } from "@/features/projects/projectsSlice";
import type { CreateProjectPayload } from "@/lib/types";

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
    <div className="container flex-col gap-6" style={{ maxWidth: "700px" }}>
      <h1>New Project</h1>
      <ProjectForm
        submitLabel="Create Project"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/projects")}
      />
    </div>
  );
}
