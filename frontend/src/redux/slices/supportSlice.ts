// src/redux/slices/supportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUpdates } from "@/services/support/updates"; // Assuming this path is correct
import { Update } from "@/config/models";

export const fetchUpdatesAsync = createAsyncThunk(
  "support/fetchUpdates",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetchUpdates(token);
      if (!response) {
        throw new Error("Invalid response");
      }
      if ("success" in response && !response.success) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue("Failed to fetch updates");
    }
  }
);

interface SupportState {
  updates: Update[] | { success: boolean; error: string };
  hasUnreadNotif: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  updates: [] as Update[] | { success: boolean; error: string },
  hasUnreadNotif: false,
  loading: false,
  error: null as string | null,
};

const updateHasUnreadNotif = (state: SupportState) => {
  state.hasUnreadNotif =
    Array.isArray(state.updates) &&
    state.updates.some((update: Update) => !update.is_read);
};

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {
    clearUpdates: state => {
      state.updates = [];
    },
    markUpdateAsReadById: (state, action) => {
      if (!Array.isArray(state.updates)) return;
      const idToUpdate = action.payload;
      const updateIndex = state.updates.findIndex(
        update => update.id === idToUpdate
      );
      if (updateIndex !== -1) {
        state.updates[updateIndex].is_read = true;
      }
      updateHasUnreadNotif(state);
    },
    markUpdatesAsRead: state => {
        if (!Array.isArray(state.updates)) return;
        state.updates.forEach(update => {
          update.is_read = true;
        });
      state.hasUnreadNotif = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUpdatesAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdatesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.updates = action.payload;
        state.error = null;
        updateHasUnreadNotif(state);
      })
      .addCase(fetchUpdatesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });
  },
});

export const { clearUpdates, markUpdatesAsRead, markUpdateAsReadById } =
  supportSlice.actions;
export default supportSlice.reducer;
