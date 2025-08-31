"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function OauthSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      await fetch('/api/session/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      router.replace('/app/work-orders');
    };
    run();
  }, [token]);

  return <main style={{ padding: 24 }}>Signing you in...</main>;
}

