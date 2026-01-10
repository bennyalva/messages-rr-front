import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import chatReducer from './features/chatSlice';
import adminReducer from './features/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
