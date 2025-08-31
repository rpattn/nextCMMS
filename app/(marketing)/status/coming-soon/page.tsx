"use client";

export const dynamic = 'force-dynamic';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import { Box, Container, Typography } from '@mui/material';

export default function StatusComingSoonPage() {
  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <img src="/static/images/status/coming-soon.svg" alt="Coming soon" style={{ maxWidth: '100%' }} />
        <Typography variant="h3" sx={{ mt: 2 }}>Coming soon</Typography>
      </Container>
    </Box>
  );
}

