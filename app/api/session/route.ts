import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(API_URL + 'auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: body.email, password: body.password, type: 'client' })
    });
    if (!res.ok) {
      const msg = await res.text();
      return NextResponse.json({ error: msg || 'Login failed' }, { status: 401 });
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
