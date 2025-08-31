"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Manages an ID-backed drawer open state synced to a URL search param (e.g., ?wo=123)
export default function useDetailsDrawer(paramKey: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [id, setId] = useState<number | string | null>(null);

  useEffect(() => {
    const idStr = searchParams ? searchParams.get(paramKey) : null;
    const parsed = idStr == null ? null : (isNaN(Number(idStr)) ? idStr : Number(idStr));
    if (parsed != null) {
      setId(parsed);
      setOpen(true);
    } else {
      setOpen(false);
      setId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, paramKey]);

  const openById = (newId: number | string) => {
    const base = searchParams ? searchParams.toString() : '';
    const params = new URLSearchParams(base);
    params.set(paramKey, String(newId));
    router.push(`${pathname}?${params.toString()}`);
  };

  const close = () => {
    const base = searchParams ? searchParams.toString() : '';
    const params = new URLSearchParams(base);
    params.delete(paramKey);
    router.push(`${pathname}?${params.toString()}`);
  };

  return useMemo(() => ({ open, id, openById, close }), [open, id]);
}
