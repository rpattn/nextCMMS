"use client";

import { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Switch, FormControlLabel } from '@mui/material';
import { useI18n } from '@/components/providers/I18nProvider';
import LanguagePicker from '@/components/common/LanguagePicker';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' }
];

const DATE_FORMATS = [
  { value: 'MMDDYY', label: 'MM/DD/YY' },
  { value: 'DDMMYY', label: 'DD/MM/YY' }
];

export default function Preferences() {
  const { t, lang, setLang } = useI18n();
  const [dateFormat, setDateFormat] = useState<'MMDDYY' | 'DDMMYY'>('MMDDYY');
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    try {
      const l = localStorage.getItem('appLang');
      const d = localStorage.getItem('appDateFormat') as 'MMDDYY' | 'DDMMYY' | null;
      const c = localStorage.getItem('appDensity');
      if (l) setLang(l as any);
      if (d === 'MMDDYY' || d === 'DDMMYY') setDateFormat(d);
      if (c) setCompact(c === 'compact');
    } catch {}
  }, []);

  // Language persistence is handled by I18nProvider.setLang

  useEffect(() => {
    try {
      localStorage.setItem('appDateFormat', dateFormat);
      document.cookie = `appDateFormat=${encodeURIComponent(dateFormat)}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, [dateFormat]);

  useEffect(() => {
    try {
      localStorage.setItem('appDensity', compact ? 'compact' : 'comfortable');
      document.cookie = `appDensity=${compact ? 'compact' : 'comfortable'}; path=/; max-age=31536000; samesite=lax`;
      // Optional: apply a data attribute for future styles
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-density', compact ? 'compact' : 'comfortable');
      }
    } catch {}
  }, [compact]);

  return (
    <Box sx={{ display: 'grid', gap: 2, minWidth: 280 }}>
      <div>
        <div style={{ marginBottom: 8, fontSize: 14, opacity: 0.8 }}>{t('language')}</div>
        <LanguagePicker />
      </div>

      <FormControl size="small">
        <InputLabel id="pref-date-label">{t('date_format')}</InputLabel>
        <Select
          labelId="pref-date-label"
          label={t('date_format')}
          value={dateFormat}
          onChange={(e: SelectChangeEvent<string>) => setDateFormat((e.target.value as any) || 'MMDDYY')}
        >
          {DATE_FORMATS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel control={<Switch checked={compact} onChange={(e) => setCompact(e.target.checked)} />} label={t('density_compact')} />
    </Box>
  );
}
