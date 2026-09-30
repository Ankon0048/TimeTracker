import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { tasksApi } from "@/lib/api/tasks";
import type {
  CreateTaskPayload,
  ReorderTasksPayload,
  Task,
  UpdateTaskPayload,
} from "@/lib/types";
import type { RootState } from "@/lib/store";
import { getDescendantIds } from "@/lib/taskHierarchy";

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

// Prefer the API's own message (e.g. a 400 explaining why a parent is invalid).
const errorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError(err) && typeof err.response?.data === "string" && err.response.data) {
    return err.response.data;
  }
  return err instanceof Error ? err.message : fallback;
};

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

// Persists the final task order of a Kanban column after a drag-and-drop.
export const reorderTasks = createAsyncThunk(
  "tasks/reorderTasks",
  async (payload: ReorderTasksPayload, { rejectWithValue }) => {
    try {
      return await tasksApi.reorder(payload);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to reorder tasks"));
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
        // The API deletes the whole subtree, so drop the descendants too.
        const removed = new Set([
          action.payload,
          ...getDescendantIds(state.items, action.payload),
        ]);
        state.items = state.items.filter((task) => !removed.has(task.id));
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(reorderTasks.fulfilled, (state, action) => {
        for (const updated of action.payload) {
          const index = state.items.findIndex((task) => task.id === updated.id);
          if (index !== -1) {
            state.items[index] = updated;
          }
        }
      })
      .addCase(reorderTasks.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

const selectTaskItems = (state: RootState) => state.tasks.items;

const byOrder = (a: Task, b: Task) => a.order - b.order || a.id - b.id;

export const selectTopLevelTasks = createSelector(
  [selectTaskItems],
  (items): Task[] => items.filter((task) => task.parentID === null).sort(byOrder)
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
    items.filter((task) => task.parentID === parentId).sort(byOrder)
  );
  childTaskSelectorCache.set(parentId, selector);
  return selector;
};

export default tasksSlice.reducer;
