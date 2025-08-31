import { cookies } from 'next/headers';
import { API_URL } from './env';

export async function apiServer<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await cookies()).get('session')?.value;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>)
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(API_URL + path, { ...init, headers, cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

