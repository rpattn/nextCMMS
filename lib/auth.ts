import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type Session = {
  token: string;
  // You may extend with decoded claims if needed.
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return { token };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', { httpOnly: true, path: '/', maxAge: 0 });
}
