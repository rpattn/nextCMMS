"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

export type RemoteOption = { id: number; label: string };

type Props = {
  label: string;
  placeholder?: string;
  value: RemoteOption[];
  onChange: (opts: RemoteOption[]) => void;
  search: (q: string) => Promise<RemoteOption[]>;
  size?: 'small' | 'medium';
  disabled?: boolean;
  debounceMs?: number;
  minChars?: number;
};

export default function MultiRemoteSearchSelect({ label, placeholder, value, onChange, search, size = 'small', disabled, debounceMs = 300, minChars = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<RemoteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const q = input.trim();
      if (q.length < minChars) {
        setOptions([]);
        return;
      }
      setLoading(true);
      const seq = ++requestSeq.current;
      try {
        const res = await search(q);
        if (seq === requestSeq.current) setOptions(res || []);
      } catch {
        if (seq === requestSeq.current) setOptions([]);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, input, search, debounceMs, minChars]);

  return (
    <Autocomplete
      multiple
      size={size}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={value}
      disabled={disabled}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      getOptionLabel={(o) => o.label}
      onChange={(_e, val) => onChange(val || [])}
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
