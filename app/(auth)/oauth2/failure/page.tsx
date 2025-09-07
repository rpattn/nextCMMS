"use client";

import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OauthFailurePage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || '';
  const provider = (searchParams?.get('provider') || '').toLowerCase();

  const providerLabel = useMemo(() => {
    const map: Record<string, string> = { google: 'Google', microsoft: 'Microsoft', github: 'GitHub' };
    if (!provider) return '';
    return map[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
  }, [provider]);

  const retryHref = provider ? `/auth/${encodeURIComponent(provider)}/start` : '/account/login';

  const [online, setOnline] = useState(true);
  useEffect(() => {
    if (typeof navigator !== 'undefined') setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <Stack spacing={2} maxWidth={560}>
        <Typography variant="h5">Authentication failed</Typography>
        {!!error && <Alert severity="error">{error}</Alert>}
        <Typography color="text.secondary">
          The authentication service is currently unavailable or your sign-in could not be completed. {providerLabel ? `Provider: ${providerLabel}. ` : ''}
          {online ? 'You appear to be online.' : 'You appear to be offline.'}
        </Typography>
        <Box display="flex" gap={1}>
          <Button component={Link as any} href={retryHref} variant="outlined">
            {providerLabel ? `Retry ${providerLabel}` : 'Retry'}
          </Button>
          <Button component={Link as any} href={"/account/login" + (error ? ("?error=" + encodeURIComponent(error)) : "")} variant="contained">
            Back to sign in
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary">
          If the issue persists, wait a moment and try again.
        </Typography>
      </Stack>
    </main>
  );
}
