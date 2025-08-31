"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';

export default function SearchBox({
  initial,
  value: controlledValue,
  onSearch
}: {
  initial?: string;
  value?: string;
  onSearch?: (value: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [uncontrolledValue, setUncontrolledValue] = useState(initial || '');

  // If a controlled value is provided, mirror it into local input state
  useEffect(() => {
    if (controlledValue !== undefined) {
      setUncontrolledValue(controlledValue);
    }
  }, [controlledValue]);

  const submit = (value: string) => {
    if (onSearch) {
      onSearch(value);
      return;
    }
    const base = searchParams ? searchParams.toString() : '';
    const params = new URLSearchParams(base);
    if (value) params.set('q', value);
    else params.delete('q');
    params.set('page', '0');
    router.push(`${pathname}?${params.toString()}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(uncontrolledValue);
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <TextField
        size="small"
        placeholder={t('search') || 'Search'}
        value={uncontrolledValue}
        onChange={(e) => setUncontrolledValue(e.target.value)}
        sx={{ minWidth: 260, maxWidth: 420, flexShrink: 0 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchTwoToneIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: uncontrolledValue ? (
            <InputAdornment position="end">
              <IconButton size="small" aria-label="clear" onClick={() => setUncontrolledValue('')}>
                <ClearTwoToneIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }}
      />
      <Button type="submit" variant="contained" size="small">
        {t('search') || 'Search'}
      </Button>
    </Box>
  );
}
