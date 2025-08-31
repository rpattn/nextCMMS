"use client";

import { Card, Container, Typography, Box } from '@mui/material';
import RegisterForm from '@/components/auth/RegisterForm';
import Logo from '@/components/common/Logo';
import { useSearchParams } from 'next/navigation';

export default function AccountRegisterPage() {
  const searchParams = useSearchParams();
  const planId = searchParams?.get('subscription-plan-id') || undefined;
  const email = searchParams?.get('email') || undefined;
  return (
    <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', py: 6 }}>
      <Card sx={{ p: 4, my: 4, width: '100%' }}>
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Logo />
          <Typography variant="h2" sx={{ mb: 1 }}>Create your account</Typography>
          <Typography variant="h4" color="text.secondary" fontWeight="normal">Get started in minutes</Typography>
        </Box>
        <RegisterForm presetEmail={email} subscriptionPlanId={planId} />
      </Card>
    </Container>
  );
}

