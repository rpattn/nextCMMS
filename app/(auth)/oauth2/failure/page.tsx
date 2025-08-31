"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OauthFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  useEffect(() => {
    if (error) {
      // Basic failure handling: redirect to login with error as query
      router.replace(`/account/login?error=${encodeURIComponent(error)}`);
    }
  }, [error]);

  return <main style={{ padding: 24 }}>Authentication failed. Redirecting…</main>;
}

