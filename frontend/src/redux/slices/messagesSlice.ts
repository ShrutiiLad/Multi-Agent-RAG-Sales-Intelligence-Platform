import { Message } from '@/config/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessagesState {
  messages: MessagesList[];
}
interface MessagesList {
  id:string;
  conversations:Message[];
}
const initialState: MessagesState = {
  messages: [],
};

export const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<MessagesList[]>) => {
      state.messages = action.payload;
    },
  },
});

export const { setMessages } = messageSlice.actions;

export default messageSlice.reducer;
