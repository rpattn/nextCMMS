import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(API_URL + 'auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let parsed: any;
    try { parsed = JSON.parse(text); } catch { parsed = { message: text }; }

    // Backend contract: message may be an access token unless it starts with 'Successful'
    const message: string | undefined = parsed?.message;
    if (typeof message === 'string' && !message.startsWith('Successful')) {
      const isProd = process.env.NODE_ENV === 'production';
      (await cookies()).set('session', message, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 60 * 24 * 14 });
    }
    return NextResponse.json(parsed, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}

