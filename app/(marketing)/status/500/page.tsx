"use client";

export const dynamic = 'force-dynamic';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import { Box, Container, Typography } from '@mui/material';

export default function Status500Page() {
  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <img src="/static/images/status/500.svg" alt="Server error" style={{ maxWidth: '100%' }} />
        <Typography variant="h3" sx={{ mt: 2 }}>Server error</Typography>
      </Container>
    </Box>
  );
}

