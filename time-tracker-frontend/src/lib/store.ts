import { configureStore } from "@reduxjs/toolkit";
import projectsReducer from "@/features/projects/projectsSlice";
import tasksReducer from "@/features/tasks/tasksSlice";
import statesReducer from "@/features/states/statesSlice";
import timersReducer from "@/features/timers/timersSlice";
import uiReducer from "@/features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    tasks: tasksReducer,
    states: statesReducer,
    timers: timersReducer,
    ui: uiReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
