"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}><h1>Login</h1></main>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = (searchParams && searchParams.get('next')) || '/profile';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Login failed' }));
      const raw = (data?.error || '').toString();
      const normalized = raw.toLowerCase().trim().replace(/[\s_-]+/g, '_');
      if (res.status === 401 && normalized === 'mfa_required') {
        try { sessionStorage.setItem('pendingLogin', JSON.stringify({ email, password })); } catch {}
        const params = new URLSearchParams();
        params.set('next', next);
        if (email) params.set('email', email);
        router.replace(`/account/mfa-challenge?${params.toString()}`);
        return;
      }
      if (res.status === 403 && normalized === 'mfa_required') {
        const params = new URLSearchParams();
        params.set('next', next);
        if (email) params.set('email', email);
        router.replace(`/account/mfa-setup?${params.toString()}`);
        return;
      }
      setError(raw || 'Login failed');
      return;
    }
    router.replace(next);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <p style={{ color: 'salmon' }}>{error}</p>}
      </form>
    </main>
  );
}
