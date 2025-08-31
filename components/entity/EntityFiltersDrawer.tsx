"use client";

import { Box, Drawer } from '@mui/material';

export default function EntityFiltersDrawer({
  open,
  onClose,
  width = 360,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  width?: number;
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Drawer open={open} onClose={onClose} anchor="right" PaperProps={{ sx: { width } }}>
      <Box sx={{ p: 2 }}>
        {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
        {children}
      </Box>
    </Drawer>
  );
}

