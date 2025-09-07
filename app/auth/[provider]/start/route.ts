import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

function backendStartUrl(provider: string, search: string) {
  const base = API_URL.endsWith('/') ? API_URL : API_URL + '/';
  const qs = search ? (search.startsWith('?') ? search : `?${search}`) : '';
  return `${base}auth/${encodeURIComponent(provider)}${qs}`;
}

export async function GET(req: NextRequest, props: { params: Promise<{ provider: string }> }) {
  const params = await props.params;
  const provider = params.provider;

  const url = backendStartUrl(provider, req.nextUrl.search);

  const host = req.headers.get('host') || req.nextUrl.host;
  const proto = req.nextUrl.protocol.replace(':', '') || 'https';
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'X-Forwarded-Host': host,
      'X-Forwarded-Proto': proto,
    },
    redirect: 'manual',
  } as RequestInit);

  if (res.status >= 300 && res.status < 400) {
    let location = res.headers.get('location') || '/auth/' + encodeURIComponent(provider) + '/callback';

    // If backend redirects to its own host (API_URL) for an app path, rewrite to this app's origin
    try {
      const api = new URL(API_URL.endsWith('/') ? API_URL : API_URL + '/');
      const appOrigin = req.nextUrl.origin;
      let locUrl: URL;
      try {
        locUrl = new URL(location);
      } catch {
        locUrl = new URL(location, api);
      }
      const apiHost = api.host.toLowerCase();
      const locHost = locUrl.host.toLowerCase().replace('127.0.0.1', 'localhost').replace('0.0.0.0', 'localhost');
      const apiHostNorm = apiHost.replace('127.0.0.1', 'localhost').replace('0.0.0.0', 'localhost');

      if (locHost === apiHostNorm && locUrl.pathname.startsWith('/')) {
        // Keep path/query but switch to app origin
        const rewritten = new URL(locUrl.pathname + locUrl.search + locUrl.hash, appOrigin).toString();
        location = rewritten;
      }
    } catch {}

    const redirectResponse = NextResponse.redirect(location, res.status as 301 | 302 | 303 | 307 | 308);

    // Pass through any Set-Cookie from backend (rare here, but safe)
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

  // Unexpected non-redirect: surface body/status for debugging
  const contentType = res.headers.get('content-type') || 'text/plain; charset=utf-8';
  const body = await res.text();
  return new NextResponse(body || 'OAuth start response.', {
    status: res.status,
    headers: { 'content-type': contentType },
  });
}
