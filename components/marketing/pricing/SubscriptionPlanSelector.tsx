"use client";

import { pricingPlans } from './pricingData';
import {
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Typography,
  useTheme
} from '@mui/material';
import CheckCircleOutlineTwoToneIcon from '@mui/icons-material/CheckCircleOutlineTwoTone';
import Link from 'next/link';

interface SubscriptionPlanSelectorProps {
  monthly: boolean;
  setMonthly: (value: ((prevState: boolean) => boolean) | boolean) => void;
}
export const PRICING_YEAR_MULTIPLIER: number = 10;

export default function SubscriptionPlanSelector({ monthly, setMonthly }: SubscriptionPlanSelectorProps) {
  const theme = useTheme();

  return (
    <Box>
      <Box display={'flex'} alignItems={'center'} justifyContent={'center'} mb={2}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          <Typography>Monthly</Typography>
          <Switch checked={!monthly} onChange={(event) => setMonthly(!event.target.checked)} sx={{ transform: 'scale(1.3)' }} size={'medium'} />
          <Typography>Annually (Save 17%)</Typography>
        </Stack>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {pricingPlans.map((plan) => (
          <Box key={plan.id} sx={{ flexBasis: { xs: '100%', md: '23%' }, minWidth: 260 }}>
            <Card sx={{ position: 'relative', transition: 'all .2s', '&:hover': { transform: 'translateY(-10px)' } }}>
              {plan.popular && (
                <Box
                  sx={{
                    background: theme.palette.success.main,
                    color: theme.palette.success.contrastText,
                    padding: theme.spacing(0.5, 1),
                    borderRadius: theme.shape.borderRadius,
                    fontSize: theme.typography.pxToRem(9),
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    position: 'absolute',
                    top: 10,
                    right: theme.spacing(1)
                  }}
                >
                  <span>Most Popular</span>
                </Box>
              )}
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box mb={2}>
                  <Typography variant="h3" component="h3" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="subtitle2">{plan.description}</Typography>
                </Box>

                <Box mt={2} mb={3}>
                  {!parseFloat(plan.price) ? (
                    <Typography variant="h3" component="div">{plan.price}</Typography>
                  ) : (
                    <>
                      <Typography variant="h2" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                        ${monthly ? plan.price : (parseFloat(plan.price) * PRICING_YEAR_MULTIPLIER).toString()}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">/{monthly ? 'month per user' : 'year per user'}</Typography>
                    </>
                  )}
                </Box>

                <List sx={{ mt: 2, flexGrow: 1 }}>
                  {plan.features.slice(0, 5).map((feature, featureIdx) => (
                    <ListItem key={`${plan.id}-${featureIdx}`} sx={{ px: 0, py: 0.6 }}>
                      <ListItemIcon sx={{ minWidth: 34 }}>
                        <CheckCircleOutlineTwoToneIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>

                <Box mt="auto" pt={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    component={Link as any}
                    href={
                      '/account/register' + (plan.id !== 'basic' ? `?subscription-plan-id=${plan.id}` : '')
                    }
                    sx={{ mb: 1 }}
                  >
                    {plan.id === 'basic' ? 'Get started' : 'Try for free'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" align="center" display="block">
                    No Credit Card Required.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
