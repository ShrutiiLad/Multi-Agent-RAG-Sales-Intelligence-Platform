import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatInfo {
  isNewChat: boolean;
  chatMessage: string;
  threadId?: string;
}
interface ChatProps {
  chatInfo: ChatInfo;
}

const initialState: ChatProps = {
  chatInfo: { isNewChat: false, chatMessage: "", threadId: "" },
};

export const chatInfoSlice = createSlice({
  name: "chatinfo",
  initialState,
  reducers: {
    setChatInfo: (state, action: PayloadAction<ChatProps>) => {
      state.chatInfo = action.payload.chatInfo;
    },
  },
});

export const { setChatInfo } = chatInfoSlice.actions;

export default chatInfoSlice.reducer;
