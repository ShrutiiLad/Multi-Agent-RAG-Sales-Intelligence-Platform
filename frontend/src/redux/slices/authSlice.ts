import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store"; // Adjust the import path as necessary
import { User } from "@/config/models";

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Save the token to localStorage
      localStorage.setItem("token", action.payload.token);
    },
    logout: state => {
      state.user = null;
      state.token = null;
      // Remove the token from localStorage
      localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = authSlice.actions;

// Selector to get the entire auth state
export const selectAuth = (state: RootState) => state.auth;

// Selector to check if the user is authenticated
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.token !== null;

export default authSlice.reducer;
export const selectToken = (state: RootState) => state.auth.token;
export const selectUser = (state: RootState) => state.auth.user;
