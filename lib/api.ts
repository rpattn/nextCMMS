// Client-safe API helper. Always routes through the Next proxy route
// so it can be used in Client Components without server-only imports.
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const url = '/api/backend/' + path.replace(/^\/+/, '');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'fetch',
    ...(init.headers as Record<string, string>)
  };
  // Only set JSON content-type when the body is not FormData
  // This allows file uploads via FormData without overriding the boundary
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !headers['Content-Type'] && !isFormData) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    // Intercept MFA requirement and redirect to setup page on client
    if (typeof window !== 'undefined' && res.status === 403) {
      let bodyStr = '';
      let bodyJson: any = null;
      try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) bodyJson = await res.json();
        else bodyStr = await res.text();
      } catch {}
      const raw = (bodyJson?.error || bodyJson?.code || bodyJson?.message || bodyStr || '').toString();
      const normalized = raw.toLowerCase().trim().replace(/[\s_-]+/g, '_');
      if (normalized === 'mfa_required' || raw.toLowerCase().includes('mfa required')) {
        const next = typeof location !== 'undefined' ? location.pathname + (location.search || '') : '/app/work-orders';
        const params = new URLSearchParams({ next });
        window.location.assign(`/account/mfa-setup?${params.toString()}`);
        throw new Error('mfa_required');
      }
    }
    throw new Error(await res.text());
  }
  return (await res.json()) as T;
}

