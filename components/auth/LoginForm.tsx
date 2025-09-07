"use client";

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = (searchParams && searchParams.get('next')) || '/app/work-orders';
  const [email, setEmail] = useState<string>(searchParams?.get('email') || '');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validations = useMemo(() => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    return errs;
  }, [email, password]);

  // Surface error messages passed via query string (e.g., OAuth failures)
  useEffect(() => {
    const err = searchParams?.get('error');
    if (err) setFormError(err);
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    // client-side guard similar to frontend
    if (validations.email || validations.password) {
      setTouched({ email: true, password: true });
      setLoading(false);
      return;
    }

    // Helper to map server errors to friendly messages
    const friendlyMessage = (status: number, normalized: string, raw: string) => {
      if (status === 0) return 'Cannot reach the server. Please check your connection and try again.';
      switch (normalized) {
        case 'invalid_credentials':
        case 'wrong_credentials':
        case 'unauthorized':
          return 'Invalid email or password.';
        case 'account_locked':
          return 'Your account is locked. Please contact an administrator.';
        case 'rate_limited':
        case 'too_many_requests':
          return 'Too many attempts. Please wait a minute and try again.';
        case 'password_expired':
          return 'Your password has expired. Please reset your password.';
        default:
          if (status >= 500) return 'The server is unavailable. Please try again later.';
          if (status === 400) return 'Invalid request. Please check your input.';
          return raw || 'Sign in failed. Please try again.';
      }
    };

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const raw = (data?.error || '').toString();
        const normalized = raw.toLowerCase().trim().replace(/[\s_-]+/g, '_');
        // 401 mfa_required -> prompt for code
        if (res.status === 401 && normalized === 'mfa_required') {
          try {
            sessionStorage.setItem('pendingLogin', JSON.stringify({ email, password }));
          } catch {}
          const params = new URLSearchParams();
          params.set('next', next);
          if (email) params.set('email', email);
          router.replace(`/account/mfa-challenge?${params.toString()}`);
          return;
        }
        // 403 mfa_required -> must set up MFA
        if (res.status === 403 && normalized === 'mfa_required') {
          const params = new URLSearchParams();
          params.set('next', next);
          if (email) params.set('email', email);
          router.replace(`/account/mfa-setup?${params.toString()}`);
          return;
        }
        setFormError(friendlyMessage(res.status, normalized, raw));
        return;
      }

      try {
        // Fetch profile to get avatar_url and cache for this session
        const me: any = await api('auth/me');
        try {
          sessionStorage.setItem('cmms_me', JSON.stringify(me));
          const img = me?.avatar_url || me?.profileImageUrl || me?.avatar || me?.picture || me?.image?.publicUrl || me?.image?.url || me?.image?.path;
          if (img) sessionStorage.setItem('cmms_avatar_url', String(img));
        } catch {}
      } catch {}
      router.replace(next);
    } catch (err) {
      setFormError('Cannot reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit}>
      <TextField
        error={Boolean(touched.email && validations.email)}
        fullWidth
        margin="normal"
        autoFocus
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        helperText={touched.email && validations.email}
      />
      <TextField
        error={Boolean(touched.password && validations.password)}
        fullWidth
        margin="normal"
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        helperText={touched.password && validations.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((s) => !s)}>
                <VisibilityIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <Box alignItems="center" display={{ xs: 'block', md: 'flex' }} justifyContent="space-between">
        <Link component={NextLink as any} href="/account/recover-password">
          <b>Forgot password?</b>
        </Link>
      </Box>
      {formError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {formError}
        </Alert>
      )}
      <Button sx={{ mt: 3 }} variant="contained" fullWidth size="large" type="submit" disabled={loading} startIcon={loading ? <CircularProgress size="1rem" /> : null}>
        Sign in
      </Button>
    </form>
  );
}
