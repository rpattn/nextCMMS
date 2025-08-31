"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Box } from '@mui/material';

export default function Logo({ size = 56 }: { size?: number }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
      <Link href="/">
        {/* Fallback to text if no image asset is provided */}
        <Image
          src="/logo.svg"
          alt="Logo"
          width={size}
          height={size}
          onError={(e: any) => {
            // if image missing, replace with text fallback
            const parent = e.currentTarget?.parentElement;
            if (parent) parent.innerHTML = '<span style="font-weight:700;font-size:20px">Atlas CMMS</span>';
          }}
        />
      </Link>
    </Box>
  );
}

