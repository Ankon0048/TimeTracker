export const API_BASE = "http://localhost:8000/api"; // Standard .NET or whatever port, but the API.md says <port>. I'll use 5000 as default or read from env. Let's use 5000. Actually, better to just put `http://localhost:5000/api` and note it.

export interface Project {
  id: number;
  name: string;
  description: string;
  start: string;
  end: string;
}

export interface Task {
  id: number;
  parentID: number | null;
  name: string;
  description: string;
  start: string;
  end: string | null;
  timeTaken: string; // e.g. "02:30:00"
  stateID: number;
  projectID?: number;
}

export interface State {
  id: number;
  name: string;
}

export const api = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${API_BASE}/Project`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  },
  createProject: async (
    project: Omit<Project, "id" | "start">
  ): Promise<Project> => {
    const res = await fetch(`${API_BASE}/Project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
  },
  updateProject: async (
    id: number,
    project: Omit<Project, "id" | "start">
  ): Promise<Project> => {
    const res = await fetch(`${API_BASE}/Project/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error("Failed to update project");
    return res.json();
  },
  deleteProject: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/Project/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete project");
  },

  // States
  getStates: async (): Promise<State[]> => {
    const res = await fetch(`${API_BASE}/State`);
    if (!res.ok) throw new Error("Failed to fetch states");
    return res.json();
  },
  createState: async (name: string): Promise<State> => {
    const res = await fetch(`${API_BASE}/State`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create state");
    return res.json();
  },

  // Tasks
  getTasks: async (): Promise<Task[]> => {
    const res = await fetch(`${API_BASE}/Task`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  },
  createTask: async (task: Omit<Task, "id" | "stateID">): Promise<Task> => {
    const res = await fetch(`${API_BASE}/Task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
  },
  updateTask: async (
    id: number,
    task: Omit<Partial<Task>, "description"> & { description: string }
  ): Promise<Task> => {
    const res = await fetch(`${API_BASE}/Task/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  },
  getParentTasks: async (projectId: number): Promise<Task[]> => {
    const res = await fetch(`${API_BASE}/Task/parent/${projectId}`);
    if (!res.ok) throw new Error("Failed to fetch parent tasks");
    return res.json();
  },
  getNestedTasks: async (parentTaskId: number): Promise<Task[]> => {
    const res = await fetch(`${API_BASE}/Task/nested/${parentTaskId}`);
    if (!res.ok) throw new Error("Failed to fetch nested tasks");
    return res.json();
  },
  deleteTask: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/Task/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete task");
  },
};
