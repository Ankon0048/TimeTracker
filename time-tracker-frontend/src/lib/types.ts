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
  timeTaken: string;
  stateID: number;
  projectID?: number;
  order: number;
}

export interface State {
  id: number;
  name: string;
}

export type CreateProjectPayload = Omit<Project, "id" | "start">;
export type UpdateProjectPayload = Omit<Project, "id" | "start">;

export type CreateTaskPayload = Omit<Task, "id" | "stateID" | "order">;
export type UpdateTaskPayload = Partial<Omit<Task, "id" | "order">>;

export interface ReorderTasksPayload {
  stateID: number;
  taskIds: number[];
}
