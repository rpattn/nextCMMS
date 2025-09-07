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
    // Try absolute first
    let locUrl: URL;
    try {
      locUrl = new URL(location);
    } catch {
      // Relative path from backend — treat as API-relative
      locUrl = new URL(location, api);
    }
    const apiHost = normalizeHost(api.host);
    const locHost = normalizeHost(locUrl.host);

    // If the redirect points to the API host, rewrite to app origin preserving path/query/hash
    if (apiHost === locHost && locUrl.pathname.startsWith('/')) {
      return new URL(locUrl.pathname + locUrl.search + locUrl.hash, appOrigin).toString();
    }
  } catch {}
  return location;
}

function backendUrl(provider: string, search: string) {
  const base = API_URL.endsWith('/') ? API_URL : API_URL + '/';
  const qs = search ? (search.startsWith('?') ? search : `?${search}`) : '';
  return `${base}auth/${encodeURIComponent(provider)}/callback${qs}`;
}

export async function GET(req: NextRequest, props: { params: Promise<{ provider: string }> }) {
  const params = await props.params;
  const provider = params.provider;

  const url = backendUrl(provider, req.nextUrl.search);

  // Call backend without following redirects to capture Set-Cookie + Location
  const host = req.headers.get('host') || req.nextUrl.host;
  const proto = req.nextUrl.protocol.replace(':', '') || 'https';
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/html;q=0.9,*/*;q=0.8',
        'X-Forwarded-Host': host,
        'X-Forwarded-Proto': proto,
      },
      redirect: 'manual',
    } as RequestInit);
  } catch (e: any) {
    const message = 'Authentication service is unavailable. Please try again later.';
    const params = new URLSearchParams({ error: message, provider });
    return NextResponse.redirect(`/oauth2/failure?${params.toString()}`, 302);
  }

  // If backend returned a redirect, mirror it and forward cookies
  if (res.status >= 300 && res.status < 400) {
    const originalLocation = res.headers.get('location') || '/app/work-orders';
    const location = rewriteToAppOrigin(req, originalLocation);
    const redirectResponse = NextResponse.redirect(location, res.status as 301 | 302 | 303 | 307 | 308);

    // Pass through Set-Cookie headers
    const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
    const cookies = typeof getSetCookie === 'function' ? getSetCookie() : undefined;
    if (cookies && Array.isArray(cookies)) {
      for (const c of cookies) redirectResponse.headers.append('set-cookie', c);
    } else {
      const sc = res.headers.get('set-cookie');
      if (sc) redirectResponse.headers.append('set-cookie', sc);
    }

    return redirectResponse;
  }

  // If backend requires linking, redirect to link-required page and preserve cookies
  if (res.status === 409) {
    let isLinkRequired = false;
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.clone().json();
        const val = String((data?.error ?? '') as any)
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '_');
        if (val === 'link_required') isLinkRequired = true;
      }
    } catch {}

    if (isLinkRequired) {
      const redirectResponse = NextResponse.redirect('/oauth2/link-required', 302);
      const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
      const cookies = typeof getSetCookie === 'function' ? getSetCookie() : undefined;
      if (cookies && Array.isArray(cookies)) {
        for (const c of cookies) redirectResponse.headers.append('set-cookie', c);
      } else {
        const sc = res.headers.get('set-cookie');
        if (sc) redirectResponse.headers.append('set-cookie', sc);
      }
      return redirectResponse;
    }
  }

  // Non-redirect responses: forward status/body minimally
  const contentType = res.headers.get('content-type') || 'text/plain; charset=utf-8';
  const body = await res.text();
  return new NextResponse(body || 'Authentication callback finished.', {
    status: res.status,
    headers: { 'content-type': contentType },
  });
}
