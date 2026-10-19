import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { renameChat, deleteChat } from "@/services/chat/threads";
import { RootState } from "@/redux/store";
import { Thread } from "@/config/models";

interface ConversationState {
  conversationsList: Thread[];
  selectedConversation: Thread | null;
}

const initialState: ConversationState = {
  conversationsList: [],
  selectedConversation: null,
};

interface RenameSuccessResponse {
  success: boolean;
}

interface DeleteSuccessResponse {
  success: boolean;
}

// Async thunk for renaming a chat
export const renameChatThunk = createAsyncThunk<
  RenameSuccessResponse,
  { token: string; threadId: string; newTitle: string },
  { state: RootState }
>(
  "conversations/renameChat",
  async ({ token, threadId, newTitle }, { rejectWithValue }) => {
    try {
      const response = await renameChat(token, threadId, newTitle);
      if (!response.success) {
        return rejectWithValue(response.error ?? "Failed to rename chat");
      }

      return { success: true };
    } catch (error) {
      return rejectWithValue("An error occurred while renaming the chat");
    }
  }
);

// Async thunk for deleting a chat
export const deleteChatThunk = createAsyncThunk<
  DeleteSuccessResponse,
  { token: string; threadId: string },
  { state: RootState }
>(
  "conversations/deleteChat",
  async ({ token, threadId }, { rejectWithValue }) => {
    try {
      const response = await deleteChat(token, threadId);
      if (!response.success) {
        return rejectWithValue(response.error ?? "Failed to delete chat");
      }

      return { success: true };
    } catch (error) {
      return rejectWithValue("An error occurred while deleting the chat");
    }
  }
);

export const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Thread[]>) => {
      state.conversationsList = action.payload;
    },
    setSelectedConversation: (state, action: PayloadAction<Thread>) => {
      state.selectedConversation = action.payload;
    },
    deSelectConversation: state => {
      state.selectedConversation = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(renameChatThunk.fulfilled, (state, action) => {
        state.conversationsList = state.conversationsList.map(chat =>
          chat.id === action.meta.arg.threadId
            ? { ...chat, title: action.meta.arg.newTitle }
            : chat
        );
      })
      .addCase(deleteChatThunk.fulfilled, (state, action) => {
        state.conversationsList = state.conversationsList.filter(
          chat => chat.id !== action.meta.arg.threadId
        );
      });
  },
});

export const {
  setConversations,
  setSelectedConversation,
  deSelectConversation,
} = conversationSlice.actions;
export default conversationSlice.reducer;
