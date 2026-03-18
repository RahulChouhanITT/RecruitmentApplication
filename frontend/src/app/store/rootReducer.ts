import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "../../features/auth/api/authApi";
import { candidateApi } from "../../features/candidate/api/candidateApi";
import { chatApi } from "../../features/dashboard/api/chatApi";
import { jobsApi } from "../../features/jobs/api/jobsApi";
import { authReducer } from "../../features/auth/state/authSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [candidateApi.reducerPath]: candidateApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [jobsApi.reducerPath]: jobsApi.reducer,
});
