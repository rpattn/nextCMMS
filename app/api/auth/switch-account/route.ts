import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const res = await fetch(`${API_URL}auth/switch-account?id=${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' } });
  }
  const data = (await res.json()) as { accessToken?: string };
  if (!data.accessToken) return NextResponse.json({ error: 'No access token' }, { status: 502 });

  cookieStore.set('session', data.accessToken, { httpOnly: true, path: '/', sameSite: 'lax' });
  return new NextResponse(null, { status: 204 });
}

