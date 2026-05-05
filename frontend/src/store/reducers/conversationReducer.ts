import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation } from '../../types/conversation';

interface ConversationState {
  current: Conversation | null;
}

const initialState: ConversationState = {
  current: null,
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setConversation(state, action: PayloadAction<Conversation | null>) {
      state.current = action.payload;
    },
    clearConversation(state) {
      state.current = null;
    },
  },
});

export const { setConversation, clearConversation } = conversationSlice.actions;
export const conversationReducer = conversationSlice.reducer;