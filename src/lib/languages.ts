export interface Language {
  code: string;
  name: string;
  hl: string; // Google hl parameter
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', hl: 'en' },
  { code: 'es', name: 'Spanish (Español)', hl: 'es' },
  { code: 'fr', name: 'French (Français)', hl: 'fr' },
  { code: 'de', name: 'German (Deutsch)', hl: 'de' },
  { code: 'it', name: 'Italian (Italiano)', hl: 'it' },
  { code: 'pt', name: 'Portuguese (Português)', hl: 'pt' },
  { code: 'nl', name: 'Dutch (Nederlands)', hl: 'nl' },
  { code: 'ja', name: 'Japanese (日本語)', hl: 'ja' },
  { code: 'ko', name: 'Korean (한국어)', hl: 'ko' },
  { code: 'th', name: 'Thai (ไทย)', hl: 'th' },
  { code: 'hi', name: 'Hindi (हिन्दी)', hl: 'hi' },
  { code: 'id', name: 'Indonesian (Bahasa)', hl: 'id' },
  { code: 'sv', name: 'Swedish (Svenska)', hl: 'sv' },
  { code: 'ar', name: 'Arabic (العربية)', hl: 'ar' },
];

export const DEFAULT_LANGUAGE = 'en';

export function getLanguageByCode(code: string): Language {
  return LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase()) || LANGUAGES[0];
}
