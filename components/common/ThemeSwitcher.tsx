"use client";

import { useContext, useMemo } from 'react';
import { ThemeContext } from '@/components/providers/AppThemeProvider';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

const THEMES: { value: string; label: string }[] = [
  { value: 'PureLightTheme', label: 'Pure Light' },
  { value: 'GreyGooseTheme', label: 'Grey Goose' },
  { value: 'PurpleFlowTheme', label: 'Purple Flow' }
];

export default function ThemeSwitcher() {
  const { themeName, setThemeName, dir, setDir } = useContext(ThemeContext);
  const { mode = 'system', setMode } = useColorScheme();

  const handleChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.value as string;
    setThemeName(name);
  };

  const current = useMemo(() => THEMES.find((t) => t.value === themeName)?.value || 'PureLightTheme', [themeName]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControl size="small" variant="outlined">
        <InputLabel id="mode-select-label">Mode</InputLabel>
        <Select
          labelId="mode-select-label"
          id="mode-select"
          label="Mode"
          value={mode as any}
          onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'system')}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="system">System</MenuItem>
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" variant="outlined">
        <InputLabel id="theme-select-label">Theme</InputLabel>
        <Select
          labelId="theme-select-label"
          id="theme-select"
          label="Theme"
          value={current}
          onChange={handleChange}
          sx={{ minWidth: 160 }}
        >
          {THEMES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Tooltip title={dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL'}>
        <IconButton size="small" onClick={() => setDir(dir === 'rtl' ? 'ltr' : 'rtl')} aria-label="toggle direction">
          <span style={{ fontSize: 16, lineHeight: 1 }}>↔</span>
        </IconButton>
      </Tooltip>
    </Box>
  );
}
