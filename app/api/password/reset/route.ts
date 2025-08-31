import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  const res = await fetch(API_URL + `auth/resetpwd?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
  const text = await res.text();
  let parsed: any;
  try { parsed = JSON.parse(text); } catch { parsed = { success: res.ok, message: text }; }
  return NextResponse.json(parsed, { status: res.status });
}

