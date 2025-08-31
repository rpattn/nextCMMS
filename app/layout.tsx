import type { Metadata } from 'next';
import './globals.css';
import AppThemeProvider from '@/components/providers/AppThemeProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { cookies } from 'next/headers';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

export const metadata: Metadata = {
  title: 'CMMS Client',
  description: 'Next.js App Router scaffold with server auth'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialLang = (cookieStore.get('appLang')?.value || 'en') as 'en' | 'fr' | 'es';
  return (
    <html lang={initialLang} suppressHydrationWarning>
      <head>
      </head>
      <body>
        <InitColorSchemeScript attribute="data" />
        <AppThemeProvider>
          <I18nProvider initialLang={initialLang}>
            <main>{children}</main>
          </I18nProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
