import { KeywordItem } from './autocomplete';

export function escapeCsvField(field: string | number | undefined | null): string {
  if (field === undefined || field === null) return '""';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function generateKeywordsCsv(
  seed: string,
  keywords: KeywordItem[],
  country: string,
  language: string
): string {
  const headers = [
    'Keyword',
    'Seed Keyword',
    'Source',
    'Country',
    'AP',
    'Difficulty',
    'Hot',
    'Score',
    'Word Count',
    'Character Count',
    'Discovery Queries',
    'Target Language',
  ];

  const rows = keywords.map((k) => [
    escapeCsvField(k.keyword),
    escapeCsvField(k.seedKeyword),
    escapeCsvField(k.source),
    escapeCsvField(k.country),
    escapeCsvField(k.apFormatted),
    escapeCsvField(k.diff),
    escapeCsvField(k.hot),
    escapeCsvField(k.relativeScore),
    escapeCsvField(k.wordCount),
    escapeCsvField(k.charCount),
    escapeCsvField(k.sources.join(', ')),
    escapeCsvField(language),
  ]);

  const headerRow = headers.map((h) => `"${h}"`).join(',');
  const dataRows = rows.map((r) => r.join(',')).join('\n');

  return `${headerRow}\n${dataRows}`;
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'keywords';
}
