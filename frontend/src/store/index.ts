import { configureStore } from '@reduxjs/toolkit';
import { conversationReducer } from './reducers/conversationReducer';
import { userReducer } from './reducers/userReducer';

export const store = configureStore({
  reducer: {
    conversation: conversationReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;