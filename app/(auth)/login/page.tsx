import OAuthButtons from '@/components/auth/OAuthButtons';
import SimpleLoginForm from '@/components/auth/SimpleLoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <OAuthButtons />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, margin: '12px 0' }}>
        <hr style={{ width: '100%', opacity: 0.3 }} />
        <span style={{ opacity: 0.7, fontSize: 12 }}>or continue with email</span>
        <hr style={{ width: '100%', opacity: 0.3 }} />
      </div>
      <SimpleLoginForm />
    </main>
  );
}
