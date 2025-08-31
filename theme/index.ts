import { Theme } from '@mui/material';
import { getEnvJSON } from '@/lib/config';
import { createPureLightTheme } from './schemes/PureLightTheme';
import { createGreyGooseTheme } from './schemes/GreyGooseTheme';
import { createPurpleFlowTheme } from './schemes/PurpleFlowTheme';

export type ThemeName = 'PureLightTheme' | 'GreyGooseTheme' | 'PurpleFlowTheme';

export function themeCreator(name: ThemeName, dir: 'ltr' | 'rtl'): Theme {
  const customColors = getEnvJSON('CUSTOM_COLORS') as any | null;
  switch (name) {
    case 'GreyGooseTheme':
      return createGreyGooseTheme(dir, customColors || undefined);
    case 'PurpleFlowTheme':
      return createPurpleFlowTheme(dir, customColors || undefined);
    case 'PureLightTheme':
    default:
      return createPureLightTheme(dir, customColors || undefined);
  }
}

