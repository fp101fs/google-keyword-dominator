export interface Country {
  code: string;
  name: string;
  gl: string; // Google gl parameter
  defaultHl: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', gl: 'us', defaultHl: 'en', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', gl: 'uk', defaultHl: 'en', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', gl: 'ca', defaultHl: 'en', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', gl: 'au', defaultHl: 'en', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', gl: 'de', defaultHl: 'de', flag: '🇩🇪' },
  { code: 'FR', name: 'France', gl: 'fr', defaultHl: 'fr', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', gl: 'es', defaultHl: 'es', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', gl: 'it', defaultHl: 'it', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', gl: 'nl', defaultHl: 'nl', flag: '🇳🇱' },
  { code: 'IN', name: 'India', gl: 'in', defaultHl: 'en', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', gl: 'br', defaultHl: 'pt', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', gl: 'mx', defaultHl: 'es', flag: '🇲🇽' },
  { code: 'JP', name: 'Japan', gl: 'jp', defaultHl: 'ja', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', gl: 'kr', defaultHl: 'ko', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', gl: 'th', defaultHl: 'th', flag: '🇹🇭' },
  { code: 'SG', name: 'Singapore', gl: 'sg', defaultHl: 'en', flag: '🇸🇬' },
  { code: 'ID', name: 'Indonesia', gl: 'id', defaultHl: 'id', flag: '🇮🇩' },
  { code: 'SE', name: 'Sweden', gl: 'se', defaultHl: 'sv', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', gl: 'ch', defaultHl: 'de', flag: '🇨🇭' },
  { code: 'AE', name: 'United Arab Emirates', gl: 'ae', defaultHl: 'ar', flag: '🇦🇪' },
];

export const DEFAULT_COUNTRY = 'US';

export function getCountryByCode(code: string): Country {
  return COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || COUNTRIES[0];
}
