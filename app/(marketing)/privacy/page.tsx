"use client";

export const dynamic = 'force-dynamic';

import MarketingHeader from '@/components/marketing/MarketingHeader';
import { Box, Card, Container, List, ListItem, Typography } from '@mui/material';
import { brand } from '@/lib/brand';

export default function PrivacyPolicyPage() {
  return (
    <Box>
      <MarketingHeader />
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h1" component="h1" gutterBottom>
            Privacy Policy
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
            Welcome to {brand.name}. We are committed to your privacy and the protection of your information.
          </Typography>
          <Typography paragraph>
            This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website {brand.website} (the "Site") or use our {brand.name} software and services (collectively, "Services").
          </Typography>
          <Typography paragraph>
            By accessing or using our Services, you signify your agreement to this Privacy Policy. If you do not agree with our policies and practices, please do not use our Services.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            2. Information We Collect
          </Typography>
          <Typography paragraph>
            We may collect personal information that identifies you as an individual or relates to an identifiable individual ("Personal Information"), including but not limited to:
          </Typography>
          <List sx={{ pl: 4, listStyleType: 'disc' }}>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                <strong>Contact Information</strong>: Your name, email address and phone number
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                <strong>Professional Information</strong>: Your company name.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                <strong>Usage Data</strong>: Information on how you use our Site and Services, including IP addresses, browser type, access times, and pages viewed.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                <strong>Account Information</strong>: Usernames, passwords, and other security information for authentication and access.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                <strong>Technical Data</strong>: Device information, operating system, browser type, and other technical identifiers.
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                <strong>Location Data</strong>: General location information derived from IP addresses.
              </Typography>
            </ListItem>
          </List>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            3. Legal Basis for Processing
          </Typography>
          <Typography paragraph>
            We process your personal information on the following legal bases: consent, contract performance, legal obligation, and legitimate interests.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            4. How We Use Your Information
          </Typography>
          <Typography paragraph>
            We use your information to provide, maintain, and improve our Services; personalize your experience; communicate with you; ensure security; and comply with legal obligations.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            5. Data Sharing & Transfers
          </Typography>
          <Typography paragraph>
            We do not sell your personal data. We may share data with service providers, within our group, or when required by law. International data transfers will be protected by appropriate safeguards.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            6. Data Retention
          </Typography>
          <Typography paragraph>
            We retain personal information only as long as necessary for the purposes outlined in this Policy, unless a longer retention period is required or permitted by law.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            7. Your Rights
          </Typography>
          <Typography paragraph>
            Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, and to data portability. You also have the right to withdraw consent and to lodge a complaint with a supervisory authority.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            8. Security
          </Typography>
          <Typography paragraph>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </Typography>

          <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            9. Contact
          </Typography>
          <Typography paragraph>
            For any questions about this Privacy Policy or our data practices, contact us at {brand.mail}.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

