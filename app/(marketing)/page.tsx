"use client";

export const dynamic = 'force-dynamic';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { brand } from '@/lib/brand';

const TypographyH1 = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(50)
}));

const TypographyH2 = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(17)
}));

export default function Page() {
  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 6, md: 10 },
            alignItems: 'center'
          }}
        >
          <Box sx={{ pr: { md: 3 } }}>
            <TypographyH1 sx={{ mb: 2 }} variant="h1">
              Built for Maintenance & Reliability teams
            </TypographyH1>
            <TypographyH2 sx={{ lineHeight: 1.5, pb: 4 }} variant="h4" color="text.secondary" fontWeight="normal">
              {brand.name} helps operations run efficiently with modern CMMS features that your team will actually use.
            </TypographyH2>
            <Button component={Link as any} href="/account/register" size="large" variant="contained">
              Try {brand.shortName}
            </Button>
            <Button sx={{ ml: 2 }} component={Link as any} href="#key-features" size="medium" variant="text">
              Key features
            </Button>
            <Button sx={{ ml: 2 }} component={Link as any} href={`mailto:${brand.mail}`} size="medium" variant="text">
              Contact us
            </Button>
          </Box>
          <Box>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ position: 'relative', zIndex: 1, borderRadius: 2, overflow: 'hidden', boxShadow: 6 }}>
                <img alt={brand.name} src="/static/images/overview/work_orders_screenshot.png" style={{ width: '100%', display: 'block' }} />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box id="key-features" sx={{ mt: 10 }}>
          <Typography variant="h3" gutterBottom>
            Key features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h6">Work order management</Typography>
              <Typography color="text.secondary">Create, schedule and track work with custom workflows.</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Asset & inventory</Typography>
              <Typography color="text.secondary">Centralize assets, parts and meters with barcodes & files.</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Analytics</Typography>
              <Typography color="text.secondary">See trends and KPIs to improve reliability and costs.</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

