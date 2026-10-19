import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User, StatsData } from "@/config/models";
import { fetchStats } from "@/services/support/admin";
import { BASE_URL, getHeaders } from "@/services/global_config";

interface RootState {
  users: User[];
  stats: StatsData | null;
  userLoading: boolean;
  statsLoading: boolean;
  userError: string | null;
  statsError: string | null;
}

// Define initial state values
const initialState: RootState = {
  users: [],
  userLoading: false,
  userError: null,
  stats: null,
  statsError: null,
  statsLoading: false,
};

export const fetchUsers = createAsyncThunk<User[], string>(
  "userDirectory/fetchUsers",
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}api/admin/users/`, {
        method: "GET",
        headers: getHeaders(token), // Use the token here
      });
      if (!response.ok) {
        if (response.status === 403) {
          return rejectWithValue("Forbidden Access: Not an admin");
        }
        throw new Error("Network response was not ok");
      }
      const users: User[] = await response.json();
      return users;
    } catch (error) {
      return rejectWithValue("An error occurred while fetching users");
    }
  }
);

export const userDirectorySlice = createSlice({
  name: "userDirectory",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.userLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.userLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload as string;
      });
  },
});

export const fetchStatsAsync = createAsyncThunk(
  "stats/fetchStats",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetchStats(token);
      if (!response) {
        throw new Error("Invalid response");
      }
      if ("success" in response && !response.success) {
        if (response.error.includes("Forbidden Access")) {
          return rejectWithValue(response.error);
        }
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      return rejectWithValue("An error occurred while fetching stats");
    }
  }
);

export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    clearStats: state => {
      state.stats = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStatsAsync.pending, state => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchStatsAsync.fulfilled, (state, action) => {
        state.statsLoading = false;
        if (!action.payload) {
          return;
        } else if ("success" in action.payload && !action.payload.success) {
          state.statsError = action.payload.error;
          return;
        } else if (!("success" in action.payload)) {
          state.stats = action.payload;

          state.statsError = null;
        }
      })
      .addCase(fetchStatsAsync.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      });
  },
});

export const statsReducer = statsSlice.reducer;
export const userDirectoryReducer = userDirectorySlice.reducer;
