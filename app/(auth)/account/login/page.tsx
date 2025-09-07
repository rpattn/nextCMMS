import { Card, Container, Typography, Box, Link, Divider } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';
import Logo from '@/components/common/Logo';
import NextLink from 'next/link';
import OAuthButtons from '@/components/auth/OAuthButtons';

export default function AccountLoginPage() {
  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', py: 6 }}>
      <Card sx={{ p: 4, my: 4, width: '100%' }}>
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Logo />
          <Typography variant="h2" sx={{ mb: 1 }}>Login</Typography>
          <Typography variant="h4" color="text.secondary" fontWeight="normal">Welcome back</Typography>
        </Box>
        <OAuthButtons />
        <Divider sx={{ my: 2 }}><Typography variant="caption" color="text.secondary">or continue with email</Typography></Divider>
        <LoginForm />
        <Box my={4} textAlign="center">
          <Typography component="span" variant="subtitle2" color="text.primary" fontWeight="bold">No account yet?</Typography>{' '}
          <Box display={{ xs: 'block', md: 'inline-block' }}>
            <Link component={NextLink as any} href="/account/register">
              <b>Sign up here</b>
            </Link>
          </Box>
        </Box>
      </Card>
    </Container>
  );
}
