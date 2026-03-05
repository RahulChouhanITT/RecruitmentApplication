import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../types";

type AuthState = {
  currentUser: AuthUser | null;
};

const initialState: AuthState = {
  currentUser: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
