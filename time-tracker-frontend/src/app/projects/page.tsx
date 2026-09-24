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
    <div className="container flex-col gap-6">
      <div className="flex-row justify-between items-center">
        <h1>Projects</h1>
        <Link href="/projects/new" className="btn btn-primary">
          <Plus size={16} style={{ marginRight: "0.375rem" }} />
          New Project
        </Link>
      </div>

      {loading && projects.length === 0 ? (
        <CardSkeletonList />
      ) : projects.length === 0 ? (
        <div className="card">
          <p className="text-muted">
            No projects yet. Create your first project to get started.
          </p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card flex-row justify-between items-center"
            >
              <Link href={`/projects/${project.id}`} className="flex-col gap-2">
                <h3>{project.name}</h3>
                <p
                  className="text-sm text-muted"
                  dangerouslySetInnerHTML={{
                    __html: project.description || "No description",
                  }}
                />
                <span className="text-xs text-muted">
                  Created {new Date(project.start).toLocaleDateString()}
                </span>
              </Link>
              <div className="flex-row gap-2">
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
