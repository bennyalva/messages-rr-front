import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/lib/constants';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export interface ThemeConfig {
  dark: ThemeColors;
  standard: ThemeColors;
}

export type ThemeName = 'dark' | 'standard';

interface ThemeState {
  activeTheme: ThemeName;
  themeConfig: ThemeConfig | null;
}

// Read saved preference from localStorage (SSR-safe)
function getInitialTheme(): ThemeName {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'standard') return saved;
  } catch { /* ignore */ }
  return 'dark';
}

const initialState: ThemeState = {
  activeTheme: getInitialTheme(),
  themeConfig: null,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeName>) {
      state.activeTheme = action.payload;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.THEME, action.payload);
        } catch { /* ignore */ }
      }
    },
    setThemeConfig(state, action: PayloadAction<ThemeConfig>) {
      state.themeConfig = action.payload;
    },
    toggleTheme(state) {
      const next: ThemeName = state.activeTheme === 'dark' ? 'standard' : 'dark';
      state.activeTheme = next;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.THEME, next);
        } catch { /* ignore */ }
      }
    },
  },
});

export const { setTheme, setThemeConfig, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
