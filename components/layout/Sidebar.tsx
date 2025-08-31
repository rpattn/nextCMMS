"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, alpha, IconButton, Tooltip, Divider } from "@mui/material";
import AssignmentTwoToneIcon from "@mui/icons-material/AssignmentTwoTone";
import PrecisionManufacturingTwoToneIcon from "@mui/icons-material/PrecisionManufacturingTwoTone";
import LocationOnTwoToneIcon from "@mui/icons-material/LocationOnTwoTone";
import SettingsTwoToneIcon from "@mui/icons-material/SettingsTwoTone";
import { useI18n } from "@/components/providers/I18nProvider";

export default function Sidebar({ inDrawer = false }: { inDrawer?: boolean }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const items = [
    {
      label: t('work_orders'),
      href: "/app/work-orders",
      icon: <AssignmentTwoToneIcon fontSize="small" />,
      // Mirrors the old /frontend link: '/app/work-orders'
    },
    {
      label: t('assets'),
      href: "/app/assets",
      icon: <PrecisionManufacturingTwoToneIcon fontSize="small" />
    },
    {
      label: t('locations'),
      href: "/app/locations",
      icon: <LocationOnTwoToneIcon fontSize="small" />
    }
  ];
  return (
    <Box
      component="aside"
      sx={(theme) => ({
        position: inDrawer ? 'static' : ({ xs: 'static', md: 'sticky' } as any),
        top: inDrawer ? undefined : ({ md: 0 } as any),
        alignSelf: inDrawer ? undefined : ({ md: 'flex-start' } as any),
        height: inDrawer ? '100%' : ({ md: '100vh' } as any),
        width: inDrawer ? 280 : ({ xs: '100%', md: theme.spacing(32) } as any),
        maxWidth: inDrawer ? 280 : ({ xs: '100%', md: theme.spacing(32) } as any),
        flexShrink: 0,
        display: inDrawer ? 'flex' : ({ xs: 'none', md: 'flex' } as any),
        flexDirection: 'column',
        borderRight: theme.direction === 'ltr' ? `1px solid ${theme.palette.divider}` : undefined,
        borderLeft: theme.direction === 'rtl' ? `1px solid ${theme.palette.divider}` : undefined,
      })}
   >
      <Box sx={{ px: 2, py: 2, fontWeight: 600 }}>
        <Link href="/">CMMS</Link>
      </Box>
      <List sx={{ py: 0, flex: 1 }}>
        {items.map((it) => {
          const active = pathname?.startsWith(it.href);
          return (
            <ListItemButton
              key={it.href}
              LinkComponent={Link as any}
              href={it.href}
              selected={!!active}
              sx={(theme) => ({
                mx: 1,
                borderRadius: 1.5,
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  },
                },
              })}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={t('settings')}>
          <IconButton LinkComponent={Link as any} href="/app/settings" color="primary" aria-label="settings">
            <SettingsTwoToneIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
