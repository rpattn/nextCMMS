"use client";

export const dynamic = 'force-dynamic';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import { Box, Card, CardContent, Container, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Typography, useMediaQuery, useTheme } from '@mui/material';
import SubscriptionPlanSelector, { PRICING_YEAR_MULTIPLIER } from '@/components/marketing/pricing/SubscriptionPlanSelector';
import { planFeatureCategories, pricingPlans } from '@/components/marketing/pricing/pricingData';
import Faq from '@/components/marketing/pricing/Faq';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PricingPage() {
  const theme = useTheme();
  const [monthly, setMonthly] = useState<boolean>(true);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const popularPlan = pricingPlans.find((plan) => plan.popular)?.id || pricingPlans[0].id;
    if (isXs) {
      const secondPlan = pricingPlans.find((plan) => plan.id !== popularPlan)?.id || '';
      setSelectedPlans([popularPlan, secondPlan]);
    } else if (isSm) {
      const otherPlans = pricingPlans.filter((plan) => plan.id !== popularPlan).slice(0, 2).map((plan) => plan.id);
      setSelectedPlans([popularPlan, ...otherPlans]);
    } else {
      setSelectedPlans(pricingPlans.map((plan) => plan.id));
    }
  }, [isXs, isSm, isMdDown]);

  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h1" component="h1" gutterBottom>
            Choose your plan and get started
          </Typography>
          <Typography variant="subtitle1">
            Our software gives Maintenance and Reliability teams the tools they need to run Operations efficiently and effectively.
          </Typography>
        </Box>

        <SubscriptionPlanSelector monthly={monthly} setMonthly={setMonthly} />

        <Box textAlign="center" my={6}>
          <Typography variant="h1" component="h1" gutterBottom>
            Compare Plans and Pricing
          </Typography>
          <Typography variant="subtitle1">See which plan is right for you</Typography>

          <Box sx={{ mt: 3, display: { xs: 'block', md: 'none' }, mx: 'auto', maxWidth: { xs: '100%', sm: '80%' } }}>
            <FormControl fullWidth>
              <InputLabel id="plan-select-label">Plans</InputLabel>
              <Select
                labelId="plan-select-label"
                multiple
                value={selectedPlans}
                onChange={(event) => setSelectedPlans(event.target.value as string[])}
                input={<OutlinedInput label="Plans" />}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                {pricingPlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexBasis: { xs: '100%', md: '33.333%' } }}></Box>
              {pricingPlans
                .filter((plan) => !isMdDown || selectedPlans.includes(plan.id))
                .map((plan) => (
                  <Box key={`compare-header-${plan.id}`} sx={{ textAlign: 'center', flexBasis: { xs: '50%', sm: '33.333%', md: '16.666%' } }}>
                    <Typography variant="h5" gutterBottom>
                      {plan.name}
                    </Typography>
                    {!parseFloat(plan.price) ? (
                      <Typography variant="body2" color="textSecondary">
                        {plan.price}
                      </Typography>
                    ) : (
                      <Typography variant="h6" color="primary">
                        ${monthly ? plan.price : (parseFloat(plan.price) * PRICING_YEAR_MULTIPLIER).toString()}
                        {`/${monthly ? 'month per user' : 'year per user'}`}
                      </Typography>
                    )}
                    <Link
                      href={'/account/register' + (plan.id !== 'basic' ? `?subscription-plan-id=${plan.id}` : '')}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>Select</Typography>
                    </Link>
                  </Box>
                ))}
            </Box>

            {planFeatureCategories.map((category, categoryIndex) => (
              <Box key={`category-${categoryIndex}`} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 'bold' }}>
                  {category.name}
                </Typography>

                {category.features.map((feature, featureIndex) => (
                  <Box
                    key={`feature-${categoryIndex}-${featureIndex}`}
                    sx={{
                      py: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      backgroundColor: featureIndex % 2 ? '#F2F5F9' : 'white',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ flexBasis: { xs: '100%', md: '33.333%' }, mb: { xs: 1, md: 0 } }}>
                      <Typography variant="body2">{feature.name}</Typography>
                    </Box>

                    {pricingPlans
                      .filter((plan) => !isMdDown || selectedPlans.includes(plan.id))
                      .map((plan) => (
                        <Box
                          key={`feature-${categoryIndex}-${featureIndex}-${plan.id}`}
                          sx={{
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexBasis: { xs: '50%', sm: '33.333%', md: '16.666%' }
                          }}
                        >
                          {(() => {
                            const key = plan.id as 'basic' | 'starter' | 'professional' | 'business';
                            const v = feature.availability[key] as boolean | string;
                            if (v === true) return <Box component="span">✔</Box>;
                            if (v === false) return <Typography variant="body2">—</Typography>;
                            return <Typography variant="body2">{v as string}</Typography>;
                          })()}
                        </Box>
                      ))}
                  </Box>
                ))}
              </Box>
            ))}
          </CardContent>
        </Card>
        <Faq />
      </Container>
    </Box>
  );
}

