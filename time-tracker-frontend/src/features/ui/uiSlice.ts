import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface OpenTask {
  taskId: number;
  projectId: number;
}

interface UiState {
  // Task shown in the task popup. Lives in the store (not page state) so the
  // header's running-tasks panel can open it from anywhere in the app; the
  // project board renders the popup when the project matches.
  openTask: OpenTask | null;
}

const initialState: UiState = {
  openTask: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openTask: (state, action: PayloadAction<OpenTask>) => {
      state.openTask = action.payload;
    },
    closeTask: (state) => {
      state.openTask = null;
    },
  },
});

export const { openTask, closeTask } = uiSlice.actions;

export default uiSlice.reducer;
