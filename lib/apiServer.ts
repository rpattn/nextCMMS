import { cookies } from 'next/headers';
import { API_URL } from './env';

export async function apiServer<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const session = (await cookies()).get('session')?.value;

  // Normalize headers (handles Record<string,string> | Headers | [][])
  const h = new Headers(init.headers || {});
  if (!h.has('Accept')) h.set('Accept', 'application/json');

  // Set Content-Type only when there's a body and it's not already set
  if (init.body && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json');
  }

  // Forward the session cookie to the backend
  if (session) {
    const existingCookie = h.get('cookie') || '';
    const hasSession = /(?:^|;\s*)session=/.test(existingCookie);
    if (!hasSession) {
      const cookieValue = `session=${encodeURIComponent(session)}`;
      h.set('cookie', existingCookie ? `${existingCookie}; ${cookieValue}` : cookieValue);
    }
    // If you were previously using Authorization, remove or keep as needed:
    // h.set('Authorization', `Bearer ${session}`); // <-- only if your backend still expects it
  }
  const res = await fetch(API_URL + path, {
    ...init,
    headers: h,
    cache: 'no-store',
  });
  /*
  //DEBUG_LOG Log body without consuming the original response
  const ctdbg = res.headers.get('content-type') ?? '';
  if (ctdbg.includes('application/json')) {
    console.log('JSON:', await res.clone().json());
  } else {
    console.log('TEXT:', (await res.clone().text()));
  }*/

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status} ${res.statusText}): ${errBody.slice(0, 500)}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  // Fallback for non-JSON responses
  return (await res.text()) as unknown as T;
}
