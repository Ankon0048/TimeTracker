import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Project } from '../services/api';
import { Trash2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectEnd, setNewProjectEnd] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenProject = () => {
    if (selectedProjectId) {
      navigate(`/project/${selectedProjectId}`);
    }
  };

  const handleDeleteProject = async () => {
    if (selectedProjectId) {
      if (window.confirm('Are you sure you want to delete this project?')) {
        try {
          await api.deleteProject(Number(selectedProjectId));
          setSelectedProjectId('');
          loadProjects();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const newProject = await api.createProject({
        name: newProjectName,
        description: newProjectDesc,
        end: newProjectEnd || new Date(new Date().getFullYear() + 1, 0, 1).toISOString(), // fallback end date
      });
      console.log(newProject);
      navigate(`/project/${newProject.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>TimeTracker</h1>

      <div className="card flex-col gap-6">
        <h2>Projects</h2>

        <div className="flex-row gap-4 items-center">
          <select
            className="select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="">-- Select a Project --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={handleOpenProject}
            disabled={!selectedProjectId}
          >
            Open Project
          </button>

          <button
            className="btn btn-icon"
            onClick={handleDeleteProject}
            disabled={!selectedProjectId}
            title="Delete Project"
            style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
          >
            <span role="img" aria-label="delete"><Trash2 size={10} /></span>
          </button>

          <button
            className="btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New Project'}
          </button>
        </div>

        {showCreateForm && (
          <form className="flex-col gap-4" onSubmit={handleCreateProject} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <h3>New Project</h3>
            <div className="flex-col gap-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                className="input"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                required
              />
            </div>
            <div className="flex-col gap-2">
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                className="input"
                value={newProjectDesc}
                onChange={e => setNewProjectDesc(e.target.value)}
              />
            </div>
            <div className="flex-col gap-2">
              <label className="text-sm font-medium">End Date (ISO format or YYYY-MM-DD)</label>
              <input
                type="text"
                className="input"
                value={newProjectEnd}
                onChange={e => setNewProjectEnd(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
