import { getMe } from '@/lib/user';
import { apiServer } from '@/lib/apiServer';
import InviteForm from '@/components/auth/InviteForm';

export default async function ProfilePage() {
  const user = await getMe().catch(() => null);
  const roleCode = String(user?.role ?? '').toLowerCase();
  const isOwner = roleCode === 'owner';

  async function inviteAction(_: any, formData: FormData) {
    'use server';
    const email = String(formData.get('email') || '').trim();
    const role = String(formData.get('role') || '').trim();
    if (!email) return { ok: false, error: 'Email is required' } as const;
    if (!role) return { ok: false, error: 'Role is required' } as const;
    try {
      const res = await apiServer<any>('auth/invite', {
        method: 'POST',
        body: JSON.stringify({ email, role })
      });
      // New API shape can be { ok: true, needs_password: true } and may or may not include accept_url
      const ok = Boolean(res?.ok);
      if (!ok) return { ok: false, error: 'Invite failed' } as const;
      const needs_password = Boolean(res?.needs_password ?? res?.needsPassword);
      const acceptUrl = res?.accept_url || res?.acceptUrl || res?.url || '';
      const payload: any = { ok: true } as const;
      if (needs_password) payload.needs_password = true;
      if (acceptUrl) payload.accept_url = String(acceptUrl);
      return payload;
    } catch (err: any) {
      const msg = (err?.message || 'Invite failed').toString().slice(0, 300);
      return { ok: false, error: msg } as const;
    }
  }
  return (
    <main>
      <h1>Profile</h1>
      {!user ? (
        <p>Could not load user.</p>
      ) : (
        <pre style={{ background: '#0f172a', padding: 16, borderRadius: 8 }}>
{JSON.stringify(user, null, 2)}
        </pre>
      )}
      {isOwner && (
        <section style={{ marginTop: 24 }}>
          <h2>Invite User</h2>
          <InviteForm action={inviteAction} />
        </section>
      )}
    </main>
  );
}
