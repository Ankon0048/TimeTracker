import { apiClient } from "@/lib/apiClient";
import type { CreateTaskPayload, Task, UpdateTaskPayload } from "@/lib/types";

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const res = await apiClient.get<Task[]>("/Task");
    return res.data;
  },
  create: async (payload: CreateTaskPayload): Promise<Task> => {
    const res = await apiClient.post<Task>("/Task", payload);
    return res.data;
  },
  update: async (id: number, payload: UpdateTaskPayload): Promise<Task> => {
    const res = await apiClient.patch<Task>(`/Task/${id}`, payload);
    return res.data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/Task/${id}`);
  },
  getByProject: async (projectId: number): Promise<Task[]> => {
    const res = await apiClient.get<Task[]>(`/Task/parent/${projectId}`);
    return res.data;
  },
  getNested: async (parentTaskId: number): Promise<Task[]> => {
    const res = await apiClient.get<Task[]>(`/Task/nested/${parentTaskId}`);
    return res.data;
  },
};
