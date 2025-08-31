"use client";

import { Drawer } from '@mui/material';

export default function EntityDetailsDrawer({
  open,
  width = 460,
  onClose,
  children
}: {
  open: boolean;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      PaperProps={{ sx: { width, maxWidth: '100vw' } }}
    >
      {children}
    </Drawer>
  );
}

