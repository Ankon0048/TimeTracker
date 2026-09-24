import { apiClient } from "@/lib/apiClient";
import type { State } from "@/lib/types";

export const statesApi = {
  getAll: async (): Promise<State[]> => {
    const res = await apiClient.get<State[]>("/State");
    return res.data;
  },
  create: async (name: string): Promise<State> => {
    const res = await apiClient.post<State>("/State", { name });
    return res.data;
  },
  update: async (id: number, name: string): Promise<State> => {
    const res = await apiClient.put<State>(`/State/${id}`, { name });
    return res.data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/State/${id}`);
  },
};
