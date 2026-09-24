import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { projectsApi } from "@/lib/api/projects";
import type {
  CreateProjectPayload,
  Project,
  UpdateProjectPayload,
} from "@/lib/types";

interface ProjectsState {
  items: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  loading: false,
  error: null,
};

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_: void, { rejectWithValue }) => {
    try {
      return await projectsApi.getAll();
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to fetch projects"));
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (payload: CreateProjectPayload, { rejectWithValue }) => {
    try {
      return await projectsApi.create(payload);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to create project"));
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async (
    { id, payload }: { id: number; payload: UpdateProjectPayload },
    { rejectWithValue }
  ) => {
    try {
      return await projectsApi.update(id, payload);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to update project"));
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id: number, { rejectWithValue }) => {
    try {
      await projectsApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to delete project"));
    }
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (project) => project.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (project) => project.id !== action.payload
        );
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default projectsSlice.reducer;
