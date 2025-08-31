import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/env';

function backendUrl(pathParts: string[]) {
  const path = pathParts.join('/');
  return API_URL + path;
}

async function forward(req: NextRequest, pathParts: string[]) {
  const token = (await cookies()).get('session')?.value;
  const url = backendUrl(pathParts);
  const method = req.method.toUpperCase();
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };
  // Only forward content-type if provided
  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init: RequestInit = { method, headers };
  if (!['GET', 'HEAD'].includes(method)) {
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(url, init);
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' }
  });
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

