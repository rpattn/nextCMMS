"use client";

import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import stylisRTLPlugin from 'stylis-plugin-rtl';
import { themeCreator } from '@/theme';
import ModeCookieSync from './ModeCookieSync';
// Swapped to MUI's official App Router cache provider

type AppThemeProviderProps = PropsWithChildren & {
  initialThemeName?: string;
  initialDir?: 'ltr' | 'rtl';
  initialDensity?: 'comfortable' | 'compact';
};

export default function AppThemeProvider({ children, initialThemeName, initialDir, initialDensity }: AppThemeProviderProps) {
  const [themeName, setThemeName] = useState<string>(initialThemeName || 'PureLightTheme');
  const [dir, setDir] = useState<'ltr' | 'rtl'>(initialDir || 'ltr');
  const [density, setDensity] = useState<'comfortable' | 'compact'>(initialDensity || 'comfortable');

  // Sync from localStorage only if no server-provided value
  useEffect(() => {
    if (initialThemeName) return;
    try {
      const saved = localStorage.getItem('appTheme');
      if (saved) setThemeName(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('appTheme', themeName);
      // also persist a cookie for SSR to pick up early and avoid theme flash
      document.cookie = `appTheme=${encodeURIComponent(themeName)}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, [themeName]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (dir === 'rtl') document.documentElement.setAttribute('dir', 'rtl');
      else document.documentElement.removeAttribute('dir');
      // persist direction for SSR as well
      try {
        document.cookie = `appDir=${dir}; path=/; max-age=31536000; samesite=lax`;
      } catch {}
    }
  }, [dir]);

  // Sync density changes and reflect to body data attribute; if server provided an initialDensity,
  // do not override it on mount to avoid hydration mismatches.
  useEffect(() => {
    if (!initialDensity) {
      try {
        const v = localStorage.getItem('appDensity');
        if (v === 'compact' || v === 'comfortable') setDensity(v);
      } catch {}
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'appDensity') {
        const v = e.newValue === 'compact' ? 'compact' : 'comfortable';
        setDensity(v);
      }
    };
    window.addEventListener('storage', onStorage);
    // Reflect as data attribute for optional CSS tweaks
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-density', density);
    }
    return () => window.removeEventListener('storage', onStorage);
  }, [density, initialDensity]);

  // Color scheme is managed by MUI CssVarsProvider + InitColorSchemeScript.

  const customTheme = useMemo(() => themeCreator(themeName as any, dir), [themeName, dir]);
  const themeOptions: any = {
    ...customTheme,
    cssVariables: {
      colorSchemeSelector: 'data',
    },
  };
  if (density === 'compact') {
    themeOptions.components = {
      MuiButton: { defaultProps: { size: 'small' } },
      MuiIconButton: { defaultProps: { size: 'small' } },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiFormControl: { defaultProps: { size: 'small' } },
      MuiSelect: { defaultProps: { size: 'small' } },
      MuiTable: { defaultProps: { size: 'small' } },
      MuiListItem: { defaultProps: { dense: true } },
      MuiMenuItem: { defaultProps: { dense: true } },
      MuiChip: { defaultProps: { size: 'small' } },
      MuiPagination: { defaultProps: { size: 'small' } },
      MuiCheckbox: { defaultProps: { size: 'small' } },
      MuiSwitch: { defaultProps: { size: 'small' } },
      MuiRadio: { defaultProps: { size: 'small' } },
      MuiInputBase: { defaultProps: { margin: 'dense' } },
    };
  } else {
    // Ensure MUI receives an object, not undefined, to avoid SSR Object.keys crash
    themeOptions.components = {};
  }
  const theme = createTheme(themeOptions);

  const emotionOptions = useMemo(() => ({
    key: 'mui',
    prepend: true,
    // memoize array to avoid recreating cache unnecessarily
    stylisPlugins: dir === 'rtl' ? [stylisRTLPlugin] : []
  }), [dir]);

  return (
    <AppRouterCacheProvider options={emotionOptions as any}>
      <ThemeContext.Provider value={{ themeName, setThemeName, dir, setDir }}>
        <ThemeProvider theme={theme as any} disableTransitionOnChange>
          <CssBaseline />
          <ModeCookieSync />
          {children}
        </ThemeProvider>
      </ThemeContext.Provider>
    </AppRouterCacheProvider>
  );
}

export const ThemeContext = (
  // minimal context to toggle theme and dir later if needed
  // matches rough shape of existing app's usage
  require('react') as typeof import('react')
).createContext<{ themeName: string; setThemeName: (n: string) => void; dir: 'ltr' | 'rtl'; setDir: (d: 'ltr' | 'rtl') => void }>({
  themeName: 'PureLightTheme',
  setThemeName: () => {},
  dir: 'ltr',
  setDir: () => {}
});
