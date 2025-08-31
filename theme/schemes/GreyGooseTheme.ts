import { extendTheme } from '@mui/material/styles';
import type { ThemeColors } from '../types';

const base: ThemeColors = {
  primary: '#2442AF',
  secondary: '#6E759F',
  success: '#57CA22',
  warning: '#FFA319',
  error: '#FF1943',
  info: '#33C2FF'
};

export function createGreyGooseTheme(dir: 'ltr' | 'rtl', overrides?: Partial<ThemeColors>) {
  const colors = { ...base, ...(overrides || {}) };
  return extendTheme({
    direction: dir,
    typography: {
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'
    },
    cssVariables: {
      colorSchemeSelector: 'data'
    },
    colorSchemes: {
      light: {
        palette: {
          background: { default: '#f7f9fc', paper: 'rgba(2,6,23,0.12)' },
          text: { primary: '#0f172a', secondary: '#334155' },
          divider: 'rgba(2,6,23,0.12)',
          action: {
            hover: 'rgba(2,6,23,0.04)',
            selected: 'rgba(2,6,23,0.08)',
            focus: 'rgba(2,6,23,0.12)'
          },
          primary: { main: colors.primary },
          secondary: { main: colors.secondary },
          success: { main: colors.success },
          warning: { main: colors.warning },
          error: { main: colors.error },
          info: { main: colors.info }
        }
      },
      dark: {
        palette: {
          background: { default: '#0b1220', paper: '#0f172a' },
          text: { primary: '#e5e7eb', secondary: '#cbd5e1' },
          divider: 'rgba(255,255,255,0.12)',
          action: {
            hover: 'rgba(255,255,255,0.08)',
            selected: 'rgba(255,255,255,0.16)',
            focus: 'rgba(255,255,255,0.24)'
          },
          primary: { main: colors.primary },
          secondary: { main: colors.secondary },
          success: { main: colors.success },
          warning: { main: colors.warning },
          error: { main: colors.error },
          info: { main: colors.info }
        }
      }
    },
    shape: { borderRadius: 10 }
  } as any);
}
