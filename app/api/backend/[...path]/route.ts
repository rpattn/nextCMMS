import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

function backendUrl(pathParts: string[]) {
  const path = pathParts.join('/');
  return API_URL + path;
}

async function forward(req: NextRequest, pathParts: string[]) {
  const url = backendUrl(pathParts);
  const method = req.method.toUpperCase();

  // Build headers to forward
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Preserve content-type if present
  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  // Forward ONLY the session cookie to the backend
  const session = req.cookies.get('session')?.value;
  if (session) {
    // If your backend expects additional cookies, merge them here.
    headers['Cookie'] = `session=${encodeURIComponent(session)}`;
  }

  // If you still want to support the old Authorization header, keep this:
  // (Safe to remove once backend exclusively uses the cookie.)
  if (session) headers['Authorization'] = `Bearer ${session}`;

  const init: RequestInit = { method, headers };

  // Forward body for non-GET/HEAD requests
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(url, init);

  // Stream body through and preserve important headers, including Set-Cookie
  const response = new NextResponse(res.body, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') || 'application/json',
      // Pass basic caching headers if present
      ...(res.headers.get('cache-control') ? { 'cache-control': res.headers.get('cache-control') as string } : {}),
    },
  });

  // Append Set-Cookie headers (supports multiple cookies)
  const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
  const cookies = typeof getSetCookie === 'function' ? getSetCookie() : undefined;
  if (cookies && Array.isArray(cookies)) {
    for (const c of cookies) response.headers.append('set-cookie', c);
  } else {
    const sc = res.headers.get('set-cookie');
    if (sc) response.headers.append('set-cookie', sc);
  }

  return response;
}


export async function GET(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return forward(req, params.path);
}
export async function POST(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return forward(req, params.path);
}
export async function PUT(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return forward(req, params.path);
}
export async function PATCH(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return forward(req, params.path);
}
export async function DELETE(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return forward(req, params.path);
}

