"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Box, IconButton, Drawer, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LanguagePicker from '@/components/common/LanguagePicker';
import UserMenu from '@/components/layout/UserMenu';
import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/providers/I18nProvider';

export default function HeaderBar() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  const pageTitle = useMemo(() => {
    const parts = (pathname || '').split('?')[0].split('/').filter(Boolean);
    // Expect /app/<section>/...
    const section = parts[1] || parts[0];
    switch (section) {
      case 'work-orders':
        return t('work_orders') || 'Work Orders';
      case 'assets':
        return t('assets') || 'Assets';
      case 'locations':
        return t('locations') || 'Locations';
      default:
        return 'CMMS';
    }
  }, [pathname, t]);

  return (
    <>
      <header style={{ padding: 16, borderBottom: '1px solid var(--mui-palette-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--mui-palette-text-primary)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
            <IconButton aria-label="open menu" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
          <span>{pageTitle}</span>
        </Box>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <LanguagePicker />
          <UserMenu />
        </nav>
      </header>

      <Drawer
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 280 }}>
          <Sidebar inDrawer />
        </Box>
      </Drawer>
    </>
  );
}
