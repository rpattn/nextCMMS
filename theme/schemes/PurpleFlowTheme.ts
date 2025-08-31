import { extendTheme } from '@mui/material/styles';
import type { ThemeColors } from '../types';

const base: ThemeColors = {
  primary: '#9b52e1',
  secondary: '#000000',
  success: '#57CA22',
  warning: '#FFA319',
  error: '#FF1943',
  info: '#33C2FF'
};

export function createPurpleFlowTheme(dir: 'ltr' | 'rtl', overrides?: Partial<ThemeColors>) {
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
          background: { default: '#f8f7ff', paper: '#ffffff' },
          text: { primary: '#1a1333', secondary: '#4a3d66' },
          divider: 'rgba(31, 41, 55, 0.12)',
          action: {
            hover: 'rgba(31, 41, 55, 0.04)',
            selected: 'rgba(31, 41, 55, 0.08)',
            focus: 'rgba(31, 41, 55, 0.12)'
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
          background: { default: '#130a22', paper: '#1d1330' },
          text: { primary: '#e9e4f7', secondary: '#c6bde3' },
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
