import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import chatReducer from './features/chatSlice';
import adminReducer from './features/adminSlice';
import themeReducer from './features/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    admin: adminReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
