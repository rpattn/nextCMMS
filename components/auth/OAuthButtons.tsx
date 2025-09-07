import { API_URL } from '@/lib/env';
import OAuthButtonsClient from './OAuthButtonsClient';

// Server Component: renders provider sign-in links based on env flags
// Reads non-public env vars on the server and outputs plain anchor buttons

function isEnabled(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.toLowerCase().trim();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on' || v === 'enabled';
}

type Provider = 'google' | 'github' | 'microsoft';

function providerLabel(p: Provider) {
  switch (p) {
    case 'google':
      return 'Sign in with Google';
    case 'github':
      return 'Sign in with GitHub';
    case 'microsoft':
      return 'Sign in with Microsoft';
  }
}

export default function OAuthButtons() {
  const enabled: Provider[] = [];
  if (isEnabled(process.env.AUTH_GOOGLE)) enabled.push('google');
  if (isEnabled(process.env.AUTH_GITHUB)) enabled.push('github');
  if (isEnabled(process.env.AUTH_MICROSOFT)) enabled.push('microsoft');

  if (enabled.length === 0) {
    return null;
  }

  return <OAuthButtonsClient providers={enabled} />;
}
