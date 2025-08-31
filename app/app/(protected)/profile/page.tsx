import { getMe } from '@/lib/user';

export default async function ProfilePage() {
  const user = await getMe().catch(() => null);
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
    </main>
  );
}

