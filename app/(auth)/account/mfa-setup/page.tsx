"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, Container, Typography, Box, Button, Link, TextField, Alert } from '@mui/material';
import NextLink from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { drawQrToCanvas } from '@/lib/tinyQr';

type SetupResponse = {
  secret?: string;
  otpauth_url?: string;
  error?: string;
};

export default function MfaSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams?.get('email') || '';
  const next = searchParams?.get('next') || '/app/work-orders';

  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnRef = useRef<string | null>(null);
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSetup() {
      setLoading(true);
      setSetupError(null);
      try {
        let res = await fetch('/api/backend/auth/mfa/totp/setup', { method: 'GET', credentials: 'include' });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data: SetupResponse = await res.json();
        if (!cancelled) {
          setSecret(data.secret || '');
          setOtpauthUrl(data.otpauth_url || '');
        }
      } catch (e: any) {
        if (!cancelled) setSetupError(e?.message || 'Failed to initialize 2FA');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadSetup();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!otpauthUrl) return;
    if (lastDrawnRef.current === otpauthUrl) return; // avoid re-drawing same URL
    const c = canvasRef.current;
    if (!c) return;
    (async () => {
      try {
        const mod: any = await import('qrcode');
        const toCanvas = mod?.toCanvas || mod?.default?.toCanvas;
        if (typeof toCanvas === 'function') {
          await toCanvas(c, otpauthUrl, { width: 220 });
          lastDrawnRef.current = otpauthUrl;
          return;
        }
        // Fallback to tiny QR
        drawQrToCanvas(c, otpauthUrl, 6, 4);
        lastDrawnRef.current = otpauthUrl;
      } catch {
        try {
          drawQrToCanvas(c, otpauthUrl, 6, 4);
          lastDrawnRef.current = otpauthUrl;
        } catch {
          // ignore drawing errors; user can use the link/secret
        }
      }
    })();
  }, [otpauthUrl]);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifyError(null);
    try {
      const res = await fetch('/api/backend/auth/mfa/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Invalid code');
      }
      // After enabling, go straight into the app
      router.replace(next || '/app/work-orders');
    } catch (e: any) {
      setVerifyError(e?.message || 'Verification failed');
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', py: 6 }}>
      <Card sx={{ p: 4, my: 4, width: '100%' }}>
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Logo />
          <Typography variant="h2" sx={{ mb: 1 }}>Two‑Factor Authentication</Typography>
          <Typography variant="h4" color="text.secondary" fontWeight="normal">Additional verification required</Typography>
        </Box>

        {setupError && <Alert severity="error" sx={{ mb: 2 }}>{setupError}</Alert>}

        <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
          <Typography variant="body1">
            Enable 2FA by scanning the setup details in your authenticator app (Authy, Google Authenticator, Microsoft Authenticator, etc.).
          </Typography>
          {loading ? (
            <Typography variant="body2" color="text.secondary">Loading setup…</Typography>
          ) : (
            <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
              {otpauthUrl ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <canvas ref={canvasRef} style={{ width: 220, height: 220 }} />
                </Box>
              ) : null}
              {otpauthUrl ? (
                <>
                  <Typography variant="subtitle2">otpauth URL</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>{otpauthUrl}</Typography>
                  <Link href={otpauthUrl}>Open in authenticator</Link>
                </>
              ) : null}
              {secret ? (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Secret</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{secret}</Typography>
                </>
              ) : null}
              {!otpauthUrl && !secret && (
                <Typography variant="body2" color="text.secondary">No setup data received. Contact your administrator.</Typography>
              )}
            </Box>
          )}
        </Box>

        <Box component="form" onSubmit={onVerify} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="6‑digit code" value={code} onChange={(e) => setCode(e.target.value)} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }} />
          {verifyError && <Alert severity="error">{verifyError}</Alert>}
          <Button type="submit" variant="contained" disabled={!code || code.length < 6}>Verify and continue</Button>
        </Box>

        <Box sx={{ display: 'grid', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => router.replace(`/account/login${email ? `?email=${encodeURIComponent(email)}` : ''}${next ? `${email ? '&' : '?'}next=${encodeURIComponent(next)}` : ''}`)}
          >
            Back to sign in
          </Button>
          <Link component={NextLink as any} href="/account/recover-password" sx={{ textAlign: 'center', mt: 1 }}>
            Need help? Recover account
          </Link>
        </Box>
      </Card>
    </Container>
  );
}
