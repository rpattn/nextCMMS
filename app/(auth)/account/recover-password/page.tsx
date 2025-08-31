"use client";

import { Box, Button, Card, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/password/reset?email=${encodeURIComponent(email)}`);
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || data?.success === false) {
      setError(data?.message || 'Failed to send reset email');
      return;
    }
    setMessage('If an account exists for this email, a reset link was sent.');
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', py: 6 }}>
      <Card sx={{ p: 4, my: 4, width: '100%' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>Recover password</Typography>
        <form onSubmit={onSubmit} noValidate>
          <TextField fullWidth type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button sx={{ mt: 2 }} variant="contained" type="submit" disabled={loading}>Send me a new password</Button>
        </form>
        {message && <Typography color="success.main" sx={{ mt: 2 }}>{message}</Typography>}
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        <Box mt={3} textAlign="right">
          <Typography component="span" variant="subtitle2" color="text.primary" fontWeight="bold">Want to sign in again?</Typography>{' '}
          <a href="/account/login"><b>Click here</b></a>
        </Box>
      </Card>
    </Container>
  );
}

