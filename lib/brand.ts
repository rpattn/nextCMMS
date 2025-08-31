export type BrandConfig = {
  name: string;
  shortName: string;
  website: string;
  mail: string;
  addressStreet?: string;
  phone?: string;
  addressCity?: string;
};

// Allow JSON via NEXT_PUBLIC_BRAND_CONFIG, else fall back to sane defaults
function getBrandFromEnv(): BrandConfig | null {
  if (typeof process !== 'undefined') {
    const raw = process.env.NEXT_PUBLIC_BRAND_CONFIG;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.name && parsed.shortName) return parsed as BrandConfig;
      } catch {}
    }
  }
  return null;
}

export const brand: BrandConfig =
  getBrandFromEnv() || {
    name: 'CMMS',
    shortName: 'CMMS',
    website: 'https://example.com',
    mail: 'support@example.com',
    addressStreet: '',
    phone: '',
    addressCity: ''
  };

