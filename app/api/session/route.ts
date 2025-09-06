import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(API_URL + 'auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        username: body.email,
        password: body.password,
        totp_code: body.totp_code || undefined,
        type: 'client'
      })
    });
    if (!res.ok) {
      // Detect MFA-related responses from backend
      let errText = '';
      let errJson: any = null;
      try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          errJson = await res.json();
        } else {
          errText = await res.text();
        }
      } catch {}

      const raw = (errJson?.error || errJson?.code || errJson?.message || errText || '').toString();
      const normalized = raw.toLowerCase().trim().replace(/[\s_-]+/g, '_');
      if (normalized === 'mfa_required') {
        // 401 -> user has MFA enabled but no code provided; prompt for code
        // 403 -> user must set up MFA; send to setup
        const status = res.status === 401 ? 401 : 403;
        return NextResponse.json({ error: 'mfa_required' }, { status });
      }
      if (normalized === 'invalid_mfa') {
        return NextResponse.json({ error: 'invalid_mfa' }, { status: 401 });
      }
      const msg = raw || 'Login failed';
      return NextResponse.json({ error: msg }, { status: res.status || 500 });
    }
    const data = (await res.headers.getSetCookie())
    if (!data) {
      return NextResponse.json({ error: 'No token in response' }, { status: 500 });
    }
    const isProd = process.env.NODE_ENV === 'production';
    const _cookies = await cookies();
    //SET COOKIES
    data.map(cookie => {
      _cookies.set({
        name: cookie.split('=')[0],
        value: cookie.split('=')[1].split(';')[0],
        httpOnly: true,
        secure: isProd, // Set to true in production
      });
    });
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
