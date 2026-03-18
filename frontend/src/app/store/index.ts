import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../../features/auth/api/authApi";
import { candidateApi } from "../../features/candidate/api/candidateApi";
import { chatApi } from "../../features/dashboard/api/chatApi";
import { jobsApi } from "../../features/jobs/api/jobsApi";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, candidateApi.middleware, jobsApi.middleware, chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
