"use client";

import { useEffect, useState } from 'react';
import { Card, Container, Typography, Box, Button, TextField, Alert, Link } from '@mui/material';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/common/Logo';

export default function MfaChallengePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get('email') || '';
  const next = searchParams?.get('next') || '/app/work-orders';
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no pending login in sessionStorage, send user back to login
    try {
      const raw = sessionStorage.getItem('pendingLogin');
      if (!raw) router.replace(`/account/login${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ''}${next ? `${emailParam ? '&' : '?'}next=${encodeURIComponent(next)}` : ''}`);
    } catch {}
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const raw = sessionStorage.getItem('pendingLogin');
      if (!raw) throw new Error('Session expired. Please sign in again.');
      const creds = JSON.parse(raw || '{}');
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: creds.email || emailParam, password: creds.password, totp_code: code })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const rawErr = (data?.error || '').toString();
        const norm = rawErr.toLowerCase().trim().replace(/[\s_-]+/g, '_');
        if (norm === 'invalid_mfa') throw new Error('Invalid two-factor code');
        if (norm === 'mfa_required') throw new Error('Two-factor code required');
        throw new Error(rawErr || 'Login failed');
      }
      try { sessionStorage.removeItem('pendingLogin'); } catch {}
      router.replace(next || '/app/work-orders');
    } catch (e: any) {
      setError(e?.message || 'Could not verify code');
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', py: 6 }}>
      <Card sx={{ p: 4, my: 4, width: '100%' }}>
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Logo />
          <Typography variant="h2" sx={{ mb: 1 }}>Enter 2FA Code</Typography>
          <Typography variant="h4" color="text.secondary" fontWeight="normal">Your account requires a TOTP code</Typography>
        </Box>
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }} autoFocus />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={!code || code.length < 6}>Verify and continue</Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={NextLink as any} href={`/account/login${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ''}${next ? `${emailParam ? '&' : '?'}next=${encodeURIComponent(next)}` : ''}`}>Back to sign in</Link>
        </Box>
      </Card>
    </Container>
  );
}

