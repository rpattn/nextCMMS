// Client-safe API helper. Always routes through the Next proxy route
// so it can be used in Client Components without server-only imports.
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const url = '/api/backend/' + path.replace(/^\/+/, '');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>)
  };
  // Only set JSON content-type when the body is not FormData
  // This allows file uploads via FormData without overriding the boundary
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !headers['Content-Type'] && !isFormData) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

