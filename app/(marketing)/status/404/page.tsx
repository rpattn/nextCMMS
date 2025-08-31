"use client";

export const dynamic = 'force-dynamic';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import { Box, Container, Typography } from '@mui/material';

export default function Status404Page() {
  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <img src="/static/images/status/404.svg" alt="Not found" style={{ maxWidth: '100%' }} />
        <Typography variant="h3" sx={{ mt: 2 }}>Page not found</Typography>
      </Container>
    </Box>
  );
}

