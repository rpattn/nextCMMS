"use client";

import { useMemo, useRef, useState } from 'react';
import { Box, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Popover, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useI18n } from '@/components/providers/I18nProvider';
import { GB, FR, ES } from 'country-flag-icons/react/3x2';

type LangOption = { code: 'en' | 'fr' | 'es'; label: string; Icon: React.ComponentType<any> };

const OPTIONS: LangOption[] = [
  { code: 'en', label: 'English', Icon: GB },
  { code: 'fr', label: 'French', Icon: FR },
  { code: 'es', label: 'Spanish', Icon: ES }
];

export default function LanguagePicker({ size = 24 }: { size?: number }) {
  const { lang, setLang } = useI18n();
  const current = useMemo(() => OPTIONS.find((o) => o.code === lang) || OPTIONS[0], [lang]);
  const ref = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Language">
        <IconButton ref={ref} onClick={() => setOpen(true)} size="small" aria-label="language picker">
          {current ? <current.Icon width={size} height={size * 2/3} /> : <LanguageIcon />}
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={ref.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 220 } } }}
      >
        <Box>
          <List>
            {OPTIONS.map(({ code, label, Icon }) => (
              <ListItemButton
                key={code}
                selected={code === current.code}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
              >
                <ListItemIcon>
                  <Icon width={22} height={14} />
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
}

