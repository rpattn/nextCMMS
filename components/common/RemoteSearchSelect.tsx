"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

export type RemoteOption = { id: number; label: string };

type Props = {
  label: string;
  placeholder?: string;
  value: RemoteOption | null;
  onChange: (opt: RemoteOption | null) => void;
  search: (q: string) => Promise<RemoteOption[]>;
  size?: 'small' | 'medium';
  disabled?: boolean;
};

export default function RemoteSearchSelect({ label, placeholder, value, onChange, search, size = 'small', disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<RemoteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await search(input.trim());
        setOptions(res || []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, input, search]);

  return (
    <Autocomplete
      size={size}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={value}
      disabled={disabled}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      getOptionLabel={(o) => o.label}
      onChange={(_e, val) => onChange(val)}
      onInputChange={(_e, val) => setInput(val)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
}

