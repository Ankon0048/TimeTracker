import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { tasksApi } from "@/lib/api/tasks";
import type { CreateTaskPayload, Task, UpdateTaskPayload } from "@/lib/types";
import type { RootState } from "@/lib/store";

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

// Fetches every task belonging to a project: its parent (top-level) tasks
// plus each one's nested subtasks, recursively, as a single flat list.
export const fetchProjectTasks = createAsyncThunk(
  "tasks/fetchProjectTasks",
  async (projectId: number, { rejectWithValue }) => {
    try {
      const parentTasks = await tasksApi.getByProject(projectId);
      const allTasks: Task[] = [...parentTasks];

      const fetchNested = async (parentId: number) => {
        const nested = await tasksApi.getNested(parentId);
        for (const child of nested) {
          allTasks.push(child);
          await fetchNested(child.id);
        }
      };

      await Promise.all(parentTasks.map((task) => fetchNested(task.id)));
      return allTasks;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to fetch tasks"));
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (payload: CreateTaskPayload, { rejectWithValue }) => {
    try {
      return await tasksApi.create(payload);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to create task"));
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { id, payload }: { id: number; payload: UpdateTaskPayload },
    { rejectWithValue }
  ) => {
    try {
      return await tasksApi.update(id, payload);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to update task"));
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: number, { rejectWithValue }) => {
    try {
      await tasksApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to delete task"));
    }
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (task) => task.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

const selectTaskItems = (state: RootState) => state.tasks.items;

export const selectTopLevelTasks = createSelector(
  [selectTaskItems],
  (items): Task[] => items.filter((task) => task.parentID === null)
);

// Cache one memoized selector per parentId so repeated calls with the same
// id (e.g. from a component re-rendering) reuse the same selector instance
// instead of creating a fresh, unmemoized one on every render.
const childTaskSelectorCache = new Map<
  number,
  (state: RootState) => Task[]
>();

export const selectChildTasks = (parentId: number): ((state: RootState) => Task[]) => {
  const cached = childTaskSelectorCache.get(parentId);
  if (cached) return cached;

  const selector = createSelector([selectTaskItems], (items): Task[] =>
    items.filter((task) => task.parentID === parentId)
  );
  childTaskSelectorCache.set(parentId, selector);
  return selector;
};

export default tasksSlice.reducer;
