"use client";

import { Card, Container, Typography, Box } from '@mui/material';

export default function VerifyEmailPage() {
  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', py: 6 }}>
      <Card sx={{ p: 4, my: 4, width: '100%' }}>
        <Box>
          <Typography variant="h2" sx={{ mb: 1 }}>Verify your email</Typography>
          <Typography variant="h4" color="text.secondary" fontWeight="normal" sx={{ mb: 3 }}>
            Please check your inbox to complete verification.
          </Typography>
        </Box>
      </Card>
    </Container>
  );
}

