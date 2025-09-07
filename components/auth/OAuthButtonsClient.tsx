"use client";

import { Stack, Button, Box } from '@mui/material';
import Image from 'next/image';

type Provider = 'google' | 'github' | 'microsoft';

export default function OAuthButtonsClient({ providers }: { providers: Provider[] }) {
  if (!providers?.length) return null;

  const items = providers.map((p) => ({
    id: p,
    label:
      p === 'google'
        ? 'Sign in with Google'
        : p === 'github'
        ? 'Sign in with GitHub'
        : 'Sign in with Microsoft',
    href: `/auth/${p}/start`,
    // image: only for providers we have a local brand asset
    img:
      p === 'google'
        ? { src: '/static/images/logo/google.svg', alt: 'Google' }
        : p === 'microsoft'
        ? { src: '/static/images/placeholders/logo/microsoft.svg', alt: 'Microsoft' }
        : undefined,
    brand:
      p === 'google' ? '#4285F4' : p === 'microsoft' ? '#0078D4' : '#24292e',
  }));

  return (
    <Stack spacing={1.25} sx={{ width: '100%', my: 1 }}>
      {items.map((it) => (
        <Button
          key={it.id}
          component="a"
          href={it.href}
          variant="outlined"
          fullWidth
          sx={(theme) => ({
            position: 'relative',
            justifyContent: 'center',
            gap: 1.25,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: 'background.paper',
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: it.brand,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(0,0,0,0.12)'
                  : 'rgba(0,0,0,0.04)',
            },
          })}
        >
          {/* Left-aligned logo, absolute to keep text centered */}
          <Box sx={{ position: 'absolute', left: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
            {it.img ? (
              <Box sx={{ width: 20, height: 20, position: 'relative' }}>
                <Image src={it.img.src} alt={it.img.alt} fill style={{ objectFit: 'contain' }} />
              </Box>
            ) : (
              // GitHub inline icon (adapts to theme via currentColor)
              <Box
                component="svg"
                sx={{ width: 20, height: 20, color: 'text.primary' }}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.477 2 2 6.486 2 12.021c0 4.425 2.865 8.18 6.839 9.504.5.093.682-.218.682-.484 0-.238-.009-.868-.013-1.704-2.782.606-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.465-1.11-1.465-.907-.62.069-.608.069-.608 1.003.071 1.53 1.032 1.53 1.032.892 1.531 2.341 1.089 2.91.833.091-.649.35-1.09.636-1.341-2.221-.254-4.555-1.113-4.555-4.956 0-1.094.39-1.988 1.03-2.688-.104-.253-.447-1.274.098-2.655 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0 1 12 6.844c.85.004 1.706.115 2.506.338 1.91-1.297 2.75-1.027 2.75-1.027.546 1.381.203 2.402.1 2.655.64.7 1.029 1.594 1.029 2.688 0 3.852-2.337 4.699-4.566 4.949.36.31.68.92.68 1.853 0 1.336-.012 2.414-.012 2.742 0 .268.18.58.688.481A10.03 10.03 0 0 0 22 12.02C22 6.486 17.523 2 12 2z"
                />
              </Box>
            )}
          </Box>
          {it.label}
        </Button>
      ))}
    </Stack>
  );
}
