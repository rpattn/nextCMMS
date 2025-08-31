import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (!token || typeof token !== 'string') return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  const isProd = process.env.NODE_ENV === 'production';
  (await cookies()).set('session', token, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 60 * 24 * 14 });
  return new NextResponse(null, { status: 204 });
}

