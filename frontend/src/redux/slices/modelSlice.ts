// src/redux/slices/modelSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bot } from '@/config/models';

interface BotState {
  selectedBot: Bot | null;
}

const initialState: BotState = {
  selectedBot: null,
};

export const botSlice = createSlice({
  name: 'bot',
  initialState,
  reducers: {
    setSelectedBot: (state, action: PayloadAction<Bot>) => {
      state.selectedBot = action.payload;
    },
  },
});

export const { setSelectedBot } = botSlice.actions;

export default botSlice.reducer;
