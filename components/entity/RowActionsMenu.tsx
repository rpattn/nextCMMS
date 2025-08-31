"use client";

import { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';

export type RowAction = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void | Promise<void>;
};

export default function RowActionsMenu({ actions, ariaLabel = 'row actions' }: { actions: RowAction[]; ariaLabel?: string }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label={ariaLabel}>
        <MoreVertTwoToneIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
        {actions.map((a) => (
          <MenuItem key={a.key} onClick={async () => { setAnchor(null); await a.onClick(); }}>
            {a.icon ? <span style={{ display: 'inline-flex', marginRight: 8 }}>{a.icon}</span> : null}
            {a.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

