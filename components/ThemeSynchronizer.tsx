'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/lib/store/hooks';

// Map from theme oklch tokens to full CSS variable sets
const DARK_DERIVED: Record<string, string> = {
  '--card': 'oklch(0.205 0 0)',
  '--card-foreground': 'oklch(0.985 0 0)',
  '--popover': 'oklch(0.205 0 0)',
  '--popover-foreground': 'oklch(0.985 0 0)',
  '--primary-foreground': 'oklch(0.205 0 0)',
  '--secondary-foreground': 'oklch(0.985 0 0)',
  '--muted': 'oklch(0.269 0 0)',
  '--muted-foreground': 'oklch(0.708 0 0)',
  '--accent-foreground': 'oklch(0.985 0 0)',
  '--destructive': 'oklch(0.704 0.191 22.216)',
  '--border': 'oklch(1 0 0 / 10%)',
  '--input': 'oklch(1 0 0 / 15%)',
  '--ring': 'oklch(0.556 0 0)',
};

const STANDARD_DERIVED: Record<string, string> = {
  '--card': 'oklch(1 0 0)',
  '--card-foreground': 'oklch(0.145 0 0)',
  '--popover': 'oklch(1 0 0)',
  '--popover-foreground': 'oklch(0.145 0 0)',
  '--primary-foreground': 'oklch(0.985 0 0)',
  '--secondary-foreground': 'oklch(0.205 0 0)',
  '--muted': 'oklch(0.97 0 0)',
  '--muted-foreground': 'oklch(0.556 0 0)',
  '--accent-foreground': 'oklch(0.205 0 0)',
  '--destructive': 'oklch(0.577 0.245 27.325)',
  '--border': 'oklch(0.922 0 0)',
  '--input': 'oklch(0.922 0 0)',
  '--ring': 'oklch(0.708 0 0)',
};

export default function ThemeSynchronizer() {
  const activeTheme = useAppSelector(state => state.theme.activeTheme);
  const themeConfig = useAppSelector(state => state.theme.themeConfig);

  useEffect(() => {
    const root = document.documentElement;

    // Toggle .dark class
    if (activeTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply custom CSS variables from themeConfig
    if (themeConfig) {
      const colors = themeConfig[activeTheme];
      if (colors) {
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--secondary', colors.secondary);
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty('--background', colors.background);
        root.style.setProperty('--foreground', colors.foreground);
      }
    }

    // Apply derived tokens based on theme mode
    const derived = activeTheme === 'dark' ? DARK_DERIVED : STANDARD_DERIVED;
    for (const [prop, value] of Object.entries(derived)) {
      root.style.setProperty(prop, value);
    }
  }, [activeTheme, themeConfig]);

  return null;
}
