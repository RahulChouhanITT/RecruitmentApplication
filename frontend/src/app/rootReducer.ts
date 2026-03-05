import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/api/authApi";
import { authReducer } from "../features/auth/state/authSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
});
