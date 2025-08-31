import MarketingHeader from '@/components/marketing/MarketingHeader';
import { Box, Container, Typography } from '@mui/material';

export default function StatusMaintenancePage() {
  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <img src="/static/images/status/maintenance.svg" alt="Maintenance" style={{ maxWidth: '100%' }} />
        <Typography variant="h3" sx={{ mt: 2 }}>Scheduled maintenance</Typography>
      </Container>
    </Box>
  );
}

