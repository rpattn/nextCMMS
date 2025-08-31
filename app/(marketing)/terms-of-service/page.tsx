"use client";

export const dynamic = 'force-dynamic';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import { Box, Card, Container, List, ListItem, Typography } from '@mui/material';
import { brand } from '@/lib/brand';

export default function TermsOfServicePage() {
  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h1" component="h1" gutterBottom>
            Terms of Service
          </Typography>
        </Box>

        <Card sx={{ mx: { md: 10, xs: 1 }, p: { xs: 2, md: 4 } }}>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            <strong>Effective Date:</strong> April 10, 2025
          </Typography>

          <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
            1. Introduction
          </Typography>
          <Typography paragraph>
            This Terms of Service Agreement ("Agreement") governs your use of the {brand.name} software and services (the "Software").
          </Typography>
          <Typography paragraph sx={{ fontWeight: 'bold' }}>
            BY ACCESSING OR USING THE SOFTWARE YOU AGREE TO BE BOUND BY THIS AGREEMENT. IF YOU ARE ENTERING INTO THIS AGREEMENT ON BEHALF OF AN ENTITY, YOU REPRESENT THAT YOU HAVE AUTHORITY TO BIND THAT ENTITY.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            2. Service Description
          </Typography>
          <Typography paragraph>
            The Software is offered as a service that may be deployed through self-hosted, cloud-based, or hybrid models.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            3. Free Trial
          </Typography>
          <Typography paragraph>We may offer a time-limited trial for evaluation purposes only.</Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            4. Subscriptions & Payment
          </Typography>
          <Typography paragraph>
            Subscription fees are billed in advance in accordance with your selected plan. All fees are non-refundable except as required by law.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            5. Acceptable Use
          </Typography>
          <Typography paragraph>
            You agree not to misuse the Software, including attempting to access it without authorization or interfering with its operation.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            6. Intellectual Property
          </Typography>
          <Typography paragraph>
            {brand.name} and all related intellectual property rights are owned by their respective owners. Open source components are governed by their own licenses.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            7. Confidentiality
          </Typography>
          <Typography paragraph>
            Both parties agree to keep confidential information secret and use it only as necessary to perform their obligations.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            8. Termination
          </Typography>
          <Typography paragraph>
            We may suspend or terminate your access for breach. You may terminate at any time; fees already paid are non-refundable.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            9. Disclaimer & Limitation of Liability
          </Typography>
          <Typography paragraph>
            THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY. TO THE MAXIMUM EXTENT PERMITTED BY LAW, LIABILITY IS LIMITED.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            10. Contact
          </Typography>
          <Typography paragraph>
            Questions about these terms? Contact us at {brand.mail}.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

