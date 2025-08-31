"use client";

import { useEffect } from 'react';
import { useColorScheme } from '@mui/material/styles';

export default function ModeCookieSync() {
  const { mode } = useColorScheme();

  useEffect(() => {
    try {
      const local = window.localStorage.getItem('mui-mode');
      const value = (mode || local || 'system') as string;
      document.cookie = `mui-mode=${value}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
    // also sync on storage changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mui-mode' && e.newValue) {
        try {
          document.cookie = `mui-mode=${e.newValue}; path=/; max-age=31536000; samesite=lax`;
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [mode]);

  return null;
}

