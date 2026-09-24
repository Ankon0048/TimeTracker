import { apiClient } from "@/lib/apiClient";
import type {
  CreateProjectPayload,
  Project,
  UpdateProjectPayload,
} from "@/lib/types";

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>("/Project");
    return res.data;
  },
  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const res = await apiClient.post<Project>("/Project", payload);
    return res.data;
  },
  update: async (
    id: number,
    payload: UpdateProjectPayload
  ): Promise<Project> => {
    const res = await apiClient.put<Project>(`/Project/${id}`, payload);
    return res.data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/Project/${id}`);
  },
};
