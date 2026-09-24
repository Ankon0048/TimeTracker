"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProjects, updateProject } from "@/features/projects/projectsSlice";
import type { CreateProjectPayload } from "@/lib/types";

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
      <div className="container">
        <p className="text-muted">
          {listLoading ? "Loading project…" : "Project not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="container flex-col gap-6" style={{ maxWidth: "700px" }}>
      <h1>Edit Project</h1>
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
    </div>
  );
}
