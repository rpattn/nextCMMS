"use client";

import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useState } from 'react';

interface FaqItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function Faq() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems: FaqItem[] = [
    {
      id: 'panel2',
      title: 'Which types of users are considered free users?',
      content: (
        <>
          <Typography variant="body1" paragraph>
            There are three user types that do not require a paid license:
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body1">
                <strong>View Only Users</strong> — Typically supervisors who log in infrequently to view maintenance activity.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Requester Users</strong> — Can only submit work requests and view their status.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Third-Party Users</strong> — Vendors/contractors that update a tagged work order via a public link.
              </Typography>
            </li>
          </Box>
        </>
      )
    },
    {
      id: 'panel3',
      title: 'Which types of users are considered paid users?',
      content: (
        <>
          <Typography variant="body1" paragraph>
            There are three user types that require a paid license:
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body1">
                <strong>Admin Users</strong> — Can manage users, accept/deny requests, and edit work orders.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Technical Users</strong> — Close out work orders in the field and create new ones.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Limited Technical Users</strong> — Same as technical but only see work orders assigned to them.
              </Typography>
            </li>
          </Box>
        </>
      )
    },
    {
      id: 'panel4',
      title: 'Can I change plans later?',
      content: <Typography>Yes, you can upgrade or downgrade anytime. Changes take effect next billing cycle.</Typography>
    },
    {
      id: 'panel5',
      title: 'Is there a free trial?',
      content: <Typography>Yes, we offer a 30-day free trial of the Professional plan.</Typography>
    },
    {
      id: 'panel6',
      title: 'Do you offer discounts for non-profits?',
      content: <Typography>Yes, contact our sales team for special pricing.</Typography>
    },
    {
      id: 'panel7',
      title: 'What payment methods do you accept?',
      content: <Typography>We accept major credit cards, bank transfers, and PayPal.</Typography>
    },
    {
      id: 'panel8',
      title: 'Can I cancel my subscription?',
      content: <Typography>Yes, cancel anytime. Access remains until the end of your billing period.</Typography>
    },
    {
      id: 'panel9',
      title: 'Is my data secure?',
      content: <Typography>Yes, data is encrypted in transit and at rest and we perform regular security audits.</Typography>
    }
  ];

  return (
    <Box sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h2" component="h2" gutterBottom textAlign="center">
        Frequently Asked Questions
      </Typography>

      <Box sx={{ mt: 2 }}>
        {faqItems.map((item) => (
          <Accordion key={item.id} expanded={expanded === item.id} onChange={handleChange(item.id)}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`${item.id}-content`} id={`${item.id}-header`}>
              <Typography variant="h6" fontWeight={'bold'}>
                {item.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>{item.content}</AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}

