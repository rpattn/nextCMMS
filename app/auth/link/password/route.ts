import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

function normalizeHost(h: string) {
  const host = h.toLowerCase();
  if (host.startsWith('127.0.0.1')) return host.replace('127.0.0.1', 'localhost');
  if (host.startsWith('[::1]')) return host.replace('[::1]', 'localhost');
  if (host.startsWith('::1')) return host.replace('::1', 'localhost');
  if (host.startsWith('0.0.0.0')) return host.replace('0.0.0.0', 'localhost');
  return host;
}

function rewriteToAppOrigin(req: NextRequest, location: string): string {
  try {
    const appOrigin = req.nextUrl.origin;
    const api = new URL(API_URL.endsWith('/') ? API_URL : API_URL + '/');
    let locUrl: URL;
    try {
      locUrl = new URL(location);
    } catch {
      locUrl = new URL(location, api);
    }
    const apiHost = normalizeHost(api.host);
    const locHost = normalizeHost(locUrl.host);

    if (apiHost === locHost && locUrl.pathname.startsWith('/')) {
      return new URL(locUrl.pathname + locUrl.search + locUrl.hash, appOrigin).toString();
    }
  } catch {}
  return location;
}

export async function POST(req: NextRequest) {
  const base = API_URL.endsWith('/') ? API_URL : API_URL + '/';
  const url = base + 'auth/link/password';

  const body = await req.arrayBuffer();
  const cookieHeader = req.headers.get('cookie') || '';
  const host = req.headers.get('host') || req.nextUrl.host;
  const proto = req.nextUrl.protocol.replace(':', '') || 'https';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': req.headers.get('content-type') || 'application/json',
      Cookie: cookieHeader,
      'X-Forwarded-Host': host,
      'X-Forwarded-Proto': proto,
    },
    body,
    redirect: 'manual',
  } as RequestInit);

  // Convert backend redirects to a 200 JSON payload for fetch callers
  if (res.status >= 300 && res.status < 400) {
    const location = rewriteToAppOrigin(req, res.headers.get('location') || '/app/work-orders');
    const json = NextResponse.json({ ok: true, redirect: location }, { status: 200 });
    const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
    const cookies = typeof getSetCookie === 'function' ? getSetCookie() : undefined;
    if (cookies && Array.isArray(cookies)) {
      for (const c of cookies) json.headers.append('set-cookie', c);
    } else {
      const sc = res.headers.get('set-cookie');
      if (sc) json.headers.append('set-cookie', sc);
    }
    return json;
  }

  // Pass-through non-redirect responses
  const text = await res.text();
  const contentType = res.headers.get('content-type') || 'application/json; charset=utf-8';
  const passthrough = new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': contentType },
  });
  const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
  const cookies = typeof getSetCookie === 'function' ? getSetCookie() : undefined;
  if (cookies && Array.isArray(cookies)) {
    for (const c of cookies) passthrough.headers.append('set-cookie', c);
  } else {
    const sc = res.headers.get('set-cookie');
    if (sc) passthrough.headers.append('set-cookie', sc);
  }
  return passthrough;
}
