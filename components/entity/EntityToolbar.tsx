"use client";

import { Box, Button, IconButton, Menu, MenuItem, Tab, Tabs, Tooltip } from '@mui/material';
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import React from 'react';

export type ToolbarMenuItem = { key: string; label: string; onClick: () => void | Promise<void> };
export type ToolbarTab = { value: string; label: string };

export default function EntityToolbar({
  title,
  tabs,
  onOpenFilters,
  filterTooltip = 'Filters',
  menuItems,
  primaryButton,
  leftExtra,
  rightExtra
}: {
  title?: React.ReactNode;
  tabs?: { value: string; onChange: (val: string) => void; items: ToolbarTab[] };
  onOpenFilters?: () => void;
  filterTooltip?: string;
  menuItems?: ToolbarMenuItem[];
  primaryButton?: { label: string; onClick: () => void; startIcon?: React.ReactNode };
  leftExtra?: React.ReactNode;
  rightExtra?: React.ReactNode;
}) {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {title}
        {tabs && (
          <Tabs value={tabs.value} onChange={(_, v) => tabs.onChange(v)}>
            {tabs.items.map((it) => (
              <Tab key={it.value} value={it.value} label={it.label} />
            ))}
          </Tabs>
        )}
        {leftExtra}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onOpenFilters && (
          <Tooltip title={filterTooltip}>
            <IconButton onClick={onOpenFilters} aria-label="filters">
              <FilterAltTwoToneIcon />
            </IconButton>
          </Tooltip>
        )}
        {menuItems && menuItems.length > 0 && (
          <>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="menu">
              <MoreVertTwoToneIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={menuOpen} onClose={() => setMenuAnchor(null)}>
              {menuItems.map((mi) => (
                <MenuItem key={mi.key} onClick={async () => { setMenuAnchor(null); await mi.onClick(); }}>
                  {mi.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
        {primaryButton && (
          <Button variant="contained" startIcon={primaryButton.startIcon} onClick={primaryButton.onClick}>
            {primaryButton.label}
          </Button>
        )}
        {rightExtra}
      </Box>
    </Box>
  );
}

