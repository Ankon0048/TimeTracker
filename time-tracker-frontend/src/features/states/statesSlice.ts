import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { statesApi } from "@/lib/api/states";
import type { State } from "@/lib/types";

interface StatesState {
  items: State[];
  loading: boolean;
  error: string | null;
}

const initialState: StatesState = {
  items: [],
  loading: false,
  error: null,
};

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export const fetchStates = createAsyncThunk(
  "states/fetchStates",
  async (_: void, { rejectWithValue }) => {
    try {
      return await statesApi.getAll();
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to fetch states"));
    }
  }
);

export const createState = createAsyncThunk(
  "states/createState",
  async (name: string, { rejectWithValue }) => {
    try {
      return await statesApi.create(name);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to create state"));
    }
  }
);

export const updateState = createAsyncThunk(
  "states/updateState",
  async ({ id, name }: { id: number; name: string }, { rejectWithValue }) => {
    try {
      return await statesApi.update(id, name);
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to update state"));
    }
  }
);

export const deleteState = createAsyncThunk(
  "states/deleteState",
  async (id: number, { rejectWithValue }) => {
    try {
      await statesApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Failed to delete state"));
    }
  }
);

const statesSlice = createSlice({
  name: "states",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createState.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateState.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteState.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default statesSlice.reducer;
