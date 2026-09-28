"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { deleteProject, fetchProjects } from "@/features/projects/projectsSlice";
import { useErrorToast } from "@/lib/useErrorToast";
import { CardSkeletonList } from "@/components/Skeleton";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { items: projects, loading, error } = useAppSelector(
    (state) => state.projects
  );

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useErrorToast(error);

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Delete project "${name}"? This cannot be undone.`)) {
      dispatch(deleteProject(id));
    }
  };

  return (
    <div className="container">
      <div className="flex-row justify-between items-center py-2">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new" className="btn btn-primary">
          <Plus size={16} />
          <span>New Project</span>
        </Link>
      </div>

      {loading && projects.length === 0 ? (
        <CardSkeletonList />
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <p className="text-muted" style={{ fontSize: "1rem" }}>
            No projects yet. Create your first project to get started.
          </p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card card-hover flex-row justify-between items-center"
              style={{ padding: "1.5rem 2rem", gap: "2rem" }}
            >
              <Link
                href={`/projects/${project.id}`}
                className="flex-col gap-2"
                style={{ flex: 1, minWidth: 0 }}
              >
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <div
                  className="text-sm text-muted"
                  style={{ lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{
                    __html: project.description || "No description",
                  }}
                />
                <span className="text-xs text-muted" style={{ marginTop: "0.25rem" }}>
                  Created {new Date(project.start).toLocaleDateString()}
                </span>
              </Link>
              <div className="flex-row gap-3" style={{ flexShrink: 0 }}>
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="btn btn-icon"
                  title="Edit project"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  className="btn btn-icon"
                  title="Delete project"
                  style={{
                    color: "var(--danger-color)",
                    borderColor: "var(--danger-color)",
                  }}
                  onClick={() => handleDelete(project.id, project.name)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
