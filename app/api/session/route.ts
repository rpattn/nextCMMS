import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(API_URL + 'auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password, type: 'client' })
    });

    if (!res.ok) {
      const msg = await res.text();
      return NextResponse.json({ error: msg || 'Login failed' }, { status: 401 });
    }
    const data = (await res.json()) as { accessToken: string };
    if (!data?.accessToken) {
      return NextResponse.json({ error: 'No token in response' }, { status: 500 });
    }
    const isProd = process.env.NODE_ENV === 'production';
    (await cookies()).set('session', data.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      // Optional: 14 days similar to current frontend
      maxAge: 60 * 60 * 24 * 14
    });
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
