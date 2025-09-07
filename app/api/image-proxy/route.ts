import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'lh3.googleusercontent.com',
  'googleusercontent.com',
]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }
    const host = target.hostname.toLowerCase();
    const allowed = Array.from(ALLOWED_HOSTS).some((h) => host === h || host.endsWith('.' + h));
    if (!allowed) return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });

    // Fetch image server-side to avoid third-party cookie/storage warnings in the browser
    const upstream = await fetch(target.toString(), {
      // never forward credentials
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        // avoid leaking referrer to upstream
        // Note: fetch() does not forward referrer by default in this context
      },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream failed: ${upstream.status}` }, { status: 502 });
    }

    // Stream the image through with proper headers
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const res = new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache avatar images for a short period; tweak as needed
        'Cache-Control': 'public, max-age=600',
        'Referrer-Policy': 'no-referrer',
      },
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Proxy error' }, { status: 500 });
  }
}

