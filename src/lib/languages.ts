export interface Language {
  code: string;
  name: string;
  hl: string; // Google hl parameter
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', hl: 'en', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish (Español)', hl: 'es', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', hl: 'fr', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', hl: 'de', flag: '🇩🇪' },
  { code: 'it', name: 'Italian (Italiano)', hl: 'it', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese (Português)', hl: 'pt', flag: '🇧🇷' },
  { code: 'nl', name: 'Dutch (Nederlands)', hl: 'nl', flag: '🇳🇱' },
  { code: 'ja', name: 'Japanese (日本語)', hl: 'ja', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean (한국어)', hl: 'ko', flag: '🇰🇷' },
  { code: 'th', name: 'Thai (ไทย)', hl: 'th', flag: '🇹🇭' },
  { code: 'hi', name: 'Hindi (हिन्दी)', hl: 'hi', flag: '🇮🇳' },
  { code: 'id', name: 'Indonesian (Bahasa)', hl: 'id', flag: '🇮🇩' },
  { code: 'sv', name: 'Swedish (Svenska)', hl: 'sv', flag: '🇸🇪' },
  { code: 'ar', name: 'Arabic (العربية)', hl: 'ar', flag: '🇦🇪' },
];

export const DEFAULT_LANGUAGE = 'en';

export function getLanguageByCode(code: string): Language {
  return LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase()) || LANGUAGES[0];
}
