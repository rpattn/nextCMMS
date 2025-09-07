import { apiServer } from '@/lib/apiServer';
import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/env';
import { cookies as nextCookies } from 'next/headers';
import InviteAcceptForm from '@/components/auth/InviteAcceptForm';

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = String(searchParams?.token || '');

  async function acceptAction(_: any, formData: FormData) {
    'use server';
    const t = token || String(formData.get('token') || '');
    if (!t) return { ok: false, error: 'Missing invite token' } as const;
    // Call backend directly to capture Set-Cookie and pass it to the user
    const jar = await nextCookies();
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    const existing = jar.get('session')?.value;
    if (existing) headers.set('cookie', `session=${encodeURIComponent(existing)}`);
    let resJson: { ok: boolean; needs_password?: boolean } | null = null;
    try {
      const res = await fetch(API_URL + 'auth/invite/accept', {
        method: 'POST',
        headers,
        body: JSON.stringify({ token: t }),
        cache: 'no-store',
        credentials: 'include',
      });
      // Capture session Set-Cookie from backend and set for the browser
      const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
      const cookieHeaders: string[] = typeof getSetCookie === 'function' ? getSetCookie() : [];
      if (!cookieHeaders.length) {
        const sc = res.headers.get('set-cookie');
        if (sc) cookieHeaders.push(sc);
      }
      for (const sc of cookieHeaders) {
        const m = /(?:^|\s)session=([^;]+)/i.exec(sc);
        if (m && m[1]) {
          const val = m[1];
          try {
            jar.set('session', val, { path: '/', httpOnly: true, sameSite: 'lax' });
          } catch {}
          break;
        }
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Invite not accepted');
        return { ok: false, error: errText.slice(0, 300) } as const;
      }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        resJson = (await res.json()) as any;
      } else {
        resJson = { ok: true } as any;
      }
    } catch (e: any) {
      const msg = (e?.message || 'Failed to accept invite').toString().slice(0, 300);
      return { ok: false, error: msg } as const;
    }
    if (!resJson?.ok) return { ok: false, error: 'Invite not accepted' } as const;
    if (!resJson.needs_password) {
      redirect('/app/work-orders');
    }
    return { ok: true, needs_password: true } as const;
  }

  async function setPasswordAction(_: any, formData: FormData) {
    'use server';
    const password = String(formData.get('password') || '');
    if (!password) return { ok: false, error: 'Password is required' } as const;
    try {
      await apiServer('auth/set-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
        credentials: 'include',
      });
    } catch (e: any) {
      const msg = (e?.message || 'Failed to set password').toString().slice(0, 300);
      return { ok: false, error: msg } as const;
    }
    // Redirect outside of try/catch so NEXT_REDIRECT isn't swallowed
    redirect('/app/work-orders');
  }

  return (
    <InviteAcceptForm token={token} acceptAction={acceptAction} setPasswordAction={setPasswordAction} />
  );
}
