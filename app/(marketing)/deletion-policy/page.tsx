"use client";

export const dynamic = 'force-dynamic';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import { Box, Card, Container, Typography } from '@mui/material';
import { brand } from '@/lib/brand';

export default function DeletionPolicyPage() {
  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h1" component="h1" gutterBottom>
            Account Deletion
          </Typography>
        </Box>
        <Card sx={{ mx: { md: 10, xs: 1 }, p: { xs: 2, md: 4 } }}>
          <Typography>
            You can delete your account at any time. Log in and navigate to Settings 	 General 	 Delete account. For assistance, contact {brand.mail}.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

