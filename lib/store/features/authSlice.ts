import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole } from '../../types/auth';
import { sessionService } from '../../services/sessionService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isHydrated = true;
      
      // Persist to localStorage
      sessionService.saveSession(action.payload.user, action.payload.token, action.payload.refreshToken);
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear from localStorage
      sessionService.clearSession();
    },
    /**
     * Hydrate auth state from localStorage session
     */
    hydrateAuth(state) {
      const session = sessionService.getSession();
      if (session) {
        state.user = session.user;
        state.token = session.token;
        state.isAuthenticated = true;
      }
      state.isHydrated = true;
    },
    /**
     * Mark hydration as complete (even if no session found)
     */
    setHydrated(state) {
      state.isHydrated = true;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Also update in localStorage
        if (state.token) {
          const session = sessionService.getSession();
          const refreshToken = session?.refreshToken || '';
          sessionService.saveSession(state.user, state.token, refreshToken);
        }
      }
    }
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  hydrateAuth, 
  setHydrated,
  updateUser 
} = authSlice.actions;

export default authSlice.reducer;
