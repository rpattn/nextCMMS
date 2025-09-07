"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Card, Container, TextField, Typography } from '@mui/material';

export default function LinkRequiredPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showTotp, setShowTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: any = { email, password };
      if (showTotp && totpCode) payload.totp_code = totpCode;
      const res = await fetch('/auth/link/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      // Treat 2xx as success; server transforms backend redirects to 200 JSON
      if (res.ok) {
        const data = await res.json().catch(() => ({} as any));
        const to = (data?.redirect as string) || '/app/work-orders';
        router.replace(to);
        return;
      }

      // Handle explicit auth errors
      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        const err = String((data as any)?.error || 'invalid_login');
        if (err === 'invalid_mfa') {
          setShowTotp(true);
          setError(((data as any)?.message as string) || 'Enter your 2FA code to continue');
        } else {
          setError('Invalid email or password');
        }
        return;
      }

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        const err = String((data as any)?.error || '');
        if (err === 'identity_linked_elsewhere') {
          setError('This identity is already linked to another account');
        } else {
          setError('Linking conflict');
        }
        return;
      }

      // Generic fallback
      let msg = 'Linking failed';
      try {
        const data = await res.json();
        if ((data as any)?.error) msg = String((data as any).error);
      } catch {}
      setError(msg);
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', py: 6 }}>
      <Card sx={{ p: 4, my: 4, width: '100%' }}>
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>Link Your Account</Typography>
          <Typography variant="h5" color="text.secondary" fontWeight="normal">
            Enter your existing account credentials to complete sign in.
          </Typography>
        </Box>
        <Box component="form" onSubmit={onSubmit}>
          <TextField
            fullWidth
            margin="normal"
            autoFocus
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {showTotp && (
            <TextField
              fullWidth
              margin="normal"
              label="2FA code"
              name="totp"
              inputMode="numeric"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              helperText="Required because this account has 2FA enabled"
              required
            />
          )}
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button sx={{ mt: 3 }} variant="contained" fullWidth size="large" type="submit" disabled={loading}>
            {loading ? 'Linking…' : 'Link account'}
          </Button>
        </Box>
      </Card>
    </Container>
  );
}
