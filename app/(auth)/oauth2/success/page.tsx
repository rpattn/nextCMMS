"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function OauthSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      await fetch('/api/session/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      // After session is set, fetch current user and cache avatar for this session
      try {
        const me: any = await api('auth/me');
        try {
          sessionStorage.setItem('cmms_me', JSON.stringify(me));
          const img = me?.avatar_url || me?.profileImageUrl || me?.avatar || me?.picture || me?.image?.publicUrl || me?.image?.url || me?.image?.path;
          if (img) sessionStorage.setItem('cmms_avatar_url', String(img));
        } catch {}
      } catch {}
      router.replace('/app/work-orders');
    };
    run();
  }, [token]);

  return <main style={{ padding: 24 }}>Signing you in...</main>;
}

