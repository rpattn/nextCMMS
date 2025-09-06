"use client";

import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
  Typography
} from "@mui/material";
import PersonOutlineTwoToneIcon from "@mui/icons-material/PersonOutlineTwoTone";
import BusinessTwoToneIcon from "@mui/icons-material/BusinessTwoTone";
import SwitchLeftTwoToneIcon from "@mui/icons-material/SwitchLeftTwoTone";
import HelpTwoToneIcon from "@mui/icons-material/HelpTwoTone";
import LockOpenTwoToneIcon from "@mui/icons-material/LockOpenTwoTone";
import { useI18n } from "@/components/providers/I18nProvider";

function initials(nameOrEmail?: string) {
  if (!nameOrEmail) return "?";
  const parts = nameOrEmail.split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || nameOrEmail[0]?.toUpperCase() || "?";
}

export default function UserMenu() {
  const user = useAuth();
  const { t } = useI18n();
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/account/login";
  };

  const switchToSuperUser = async (id: number) => {
    try {
      setSwitching(true);
      const res = await fetch(`/api/auth/switch-account?id=${encodeURIComponent(id)}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to switch account");
      window.location.href = "/app/work-orders";
    } finally {
      setSwitching(false);
    }
  };

  const parent = (user as any)?.parentSuperAccount as { superUserId: number } | undefined;

  const imageUrl = useMemo(() => {
    const u: any = user || {};
    return (
      u?.profileImageUrl ||
      u?.avatar ||
      u?.picture ||
      u?.image?.publicUrl ||
      u?.image?.url ||
      u?.image?.path ||
      undefined
    );
  }, [user]);

  return (
    <>
      <IconButton ref={anchorRef} onClick={() => setOpen(true)} size="small" aria-label="user menu">
        <Avatar sx={{ width: 32, height: 32 }} src={imageUrl} alt={user?.name || user?.email || "User"}>
          {initials(user?.name || user?.email)}
        </Avatar>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1 } } }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1.5, maxWidth: 280 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40 }} src={imageUrl} alt={user?.name || user?.email || "User"}>
              {initials(user?.name || user?.email)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap>{user?.name || user?.email}</Typography>
              {user?.email && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        <Divider />
        <MenuList sx={{ p: 1 }}>
          <MenuItem component={Link} href="/app/profile" onClick={() => setOpen(false)}>
            <ListItemIcon>
              <PersonOutlineTwoToneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('my_account') || 'My Account'} />
          </MenuItem>
          {!!parent && (
            <MenuItem onClick={() => switchToSuperUser(parent.superUserId)} disabled={switching}>
              <ListItemIcon>
                <SwitchLeftTwoToneIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={switching ? t('switching') || 'Switching...' : t('switch_to_super_user') || 'Switch to Super User'} />
            </MenuItem>
          )}
          <MenuItem onClick={() => window.open("https://grashjs.github.io/user-guide", "_blank")}> 
            <ListItemIcon>
              <HelpTwoToneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('documentation') || 'Documentation'} />
          </MenuItem>
        </MenuList>
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button fullWidth color="primary" onClick={handleLogout} startIcon={<LockOpenTwoToneIcon />}>
            {t('sign_out') || 'Sign out'}
          </Button>
        </Box>
      </Popover>
    </>
  );
}
