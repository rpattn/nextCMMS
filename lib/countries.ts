// Copied subset from frontend/src/i18n/countries.ts (trimmed for brevity)
const countries: readonly { code: string; label: string; phone: string; suggested?: boolean }[] = [
  { code: 'US', label: 'United States', phone: '1', suggested: true },
  { code: 'CA', label: 'Canada', phone: '1', suggested: true },
  { code: 'GB', label: 'United Kingdom', phone: '44' },
  { code: 'FR', label: 'France', phone: '33' },
  { code: 'DE', label: 'Germany', phone: '49' },
  { code: 'ES', label: 'Spain', phone: '34' },
  { code: 'AE', label: 'United Arab Emirates', phone: '971' },
  { code: 'IN', label: 'India', phone: '91' },
  { code: 'AU', label: 'Australia', phone: '61' },
  { code: 'BR', label: 'Brazil', phone: '55' },
];

export default countries;

