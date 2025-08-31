import { requireSession } from '@/lib/auth';
import { getMe } from '@/lib/user';
import { AuthProvider } from '@/components/auth/AuthProvider';
import UserMenu from '@/components/layout/UserMenu';
import LanguagePicker from '@/components/common/LanguagePicker';
import Sidebar from '@/components/layout/Sidebar';
import { Box } from '@mui/material';
import HeaderBar from '@/components/layout/HeaderBar';
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard
  await requireSession();
  const user = await getMe().catch(() => null);
  return (
    <AuthProvider user={user}>
      <Box component="section" sx={{ display: 'flex', minHeight: '100dvh' }}>

        <Sidebar />
        <Box component="div" sx={{ flex: 1, minWidth: 0 }}>
          <HeaderBar />
          <div style={{ padding: 24 }}>{children}</div>
        </Box>
      </Box>
    </AuthProvider>
  );
}
