import { getCountryByCode } from './countries';
import { getLanguageByCode } from './languages';

export interface AutocompleteOptions {
  query: string;
  country?: string;
  language?: string;
  timeoutMs?: number;
}

export interface AutocompleteResult {
  query: string;
  suggestions: string[];
  source: 'google';
  country: string;
  language: string;
  timestamp: number;
}

export type DifficultyLevel = 'Low' | 'Med' | 'High';
export type HotLevel = 'Hottest keyword' | 'Hot keyword' | 'Trending' | '-';

export interface KeywordItem {
  keyword: string;
  seedKeyword: string;
  source: string;       // Primary discovery source/query type (e.g. 'Google Search', 'Alphabet', 'Questions', etc.)
  country: string;
  ap: number;           // Autocomplete Placement rank (1 = 1st, 2 = 2nd, etc.)
  apFormatted: string;  // '1st', '2nd', '3rd', '4th', etc.
  diff: DifficultyLevel; // Difficulty level calculated mathematically
  hot: HotLevel;        // Hotness status
  relativeScore: number; // Transparent score 0-100 (e.g., 97.59)
  wordCount: number;
  charCount: number;
  sources: string[];
}

export interface KeywordSummaryMetrics {
  totalKeywords: number;
  hotKeywordsCount: number;
  avgScore: number;
  avgAp: number;
  apLte3Count: number;
  difficultyBreakdown: {
    low: number;
    med: number;
    high: number;
  };
  seedCount: number;
}

/**
 * Formats an AP rank number into ordinal string ('1st', '2nd', '3rd', etc.)
 */
export function formatAp(ap: number): string {
  const j = ap % 10;
  const k = ap % 100;
  if (j === 1 && k !== 11) return `${ap}st`;
  if (j === 2 && k !== 12) return `${ap}nd`;
  if (j === 3 && k !== 13) return `${ap}rd`;
  return `${ap}th`;
}

/**
 * Normalizes a raw string from Google autocomplete.
 */
export function normalizeKeyword(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // remove HTML tags if any
    .replace(/\s+/g, ' ')    // normalize multiple whitespaces
    .trim();
}

/**
 * Fetches genuine suggestions for a single query from Google's completion API.
 */
export async function fetchGoogleSuggestions(options: AutocompleteOptions): Promise<string[]> {
  const { query, country = 'US', language = 'en', timeoutMs = 8000 } = options;
  const trimmed = query.trim();
  if (!trimmed) return [];

  const countryObj = getCountryByCode(country);
  const langObj = getLanguageByCode(language);

  // Use Google's public complete endpoint with chrome client for richer suggestion lists and metadata
  const url = new URL('https://suggestqueries.google.com/complete/search');
  url.searchParams.set('client', 'chrome');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('gl', countryObj.gl);
  url.searchParams.set('hl', langObj.hl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': `${langObj.hl},en-US;q=0.9,en;q=0.8`,
      },
    });

    if (!res.ok) {
      throw new Error(`Google Autocomplete API returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[1])) {
      const rawList = data[1] as unknown[];
      const suggestions: string[] = [];
      for (const item of rawList) {
        if (typeof item === 'string') {
          const norm = normalizeKeyword(item);
          if (norm.length > 0) {
            suggestions.push(norm);
          }
        }
      }
      return suggestions;
    }

    return [];
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Autocomplete request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface BatchKeywordRequest {
  seed: string;
  country: string;
  language: string;
  includeAlphabet?: boolean;
  includeQuestions?: boolean;
  includePrepositions?: boolean;
  maxResults?: number;
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const NUMBERS = '0123456789'.split('');
const QUESTION_PREFIXES = ['how', 'what', 'why', 'where', 'who', 'when', 'can', 'which', 'is', 'are', 'best', 'top', 'vs'];
const PREPOSITIONS = ['for', 'with', 'without', 'to', 'in', 'near', 'on', 'like', 'under', 'vs'];

/**
 * Retrieves genuine keyword suggestions with controlled concurrency and deduplication.
 * NEVER fabricates data: returns only what Google returned.
 */
export async function getExpandedKeywords(
  req: BatchKeywordRequest,
  onProgress?: (completed: number, total: number) => void
): Promise<{
  keywords: KeywordItem[];
  metrics: KeywordSummaryMetrics;
  totalQueriesExecuted: number;
}> {
  const seed = normalizeKeyword(req.seed);
  if (!seed) {
    return {
      keywords: [],
      metrics: {
        totalKeywords: 0,
        hotKeywordsCount: 0,
        avgScore: 0,
        avgAp: 0,
        apLte3Count: 0,
        difficultyBreakdown: { low: 0, med: 0, high: 0 },
        seedCount: 0,
      },
      totalQueriesExecuted: 0,
    };
  }

  // Construct legitimate subqueries
  const subqueries: { query: string; source: string; category: string }[] = [];

  // 1. Root query
  subqueries.push({ query: seed, source: 'seed', category: 'Google' });

  // 2. Specific expansion toggles
  if (req.includeAlphabet) {
    for (const char of ALPHABET) {
      subqueries.push({ query: `${seed} ${char}`, source: `suffix-${char}`, category: 'Alphabet' });
    }
    for (const num of NUMBERS) {
      subqueries.push({ query: `${seed} ${num}`, source: `suffix-${num}`, category: 'Numbers' });
    }
  }

  if (req.includeQuestions) {
    for (const q of QUESTION_PREFIXES) {
      subqueries.push({ query: `${q} ${seed}`, source: `question-${q}`, category: 'Questions' });
    }
  }

  if (req.includePrepositions) {
    for (const prep of PREPOSITIONS) {
      subqueries.push({ query: `${seed} ${prep}`, source: `prep-${prep}`, category: 'Prepositions' });
    }
  }

  // 3. Default deep discovery: If no specific option is toggled, query alphabet & top modifiers
  if (!req.includeAlphabet && !req.includeQuestions && !req.includePrepositions) {
    for (const char of ALPHABET) {
      subqueries.push({ query: `${seed} ${char}`, source: `alpha-${char}`, category: 'Alphabet' });
    }
    for (const q of ['how to', 'best', 'for', 'with', 'vs']) {
      subqueries.push({ query: `${q} ${seed}`, source: `mod-${q}`, category: 'Modifier' });
    }
  }

  // Execute subqueries with concurrency limiter (batch size 6)
  const CONCURRENCY = 6;
  const resultMap = new Map<
    string,
    {
      keyword: string;
      sources: Set<string>;
      categories: Set<string>;
      minRank: number; // 0-indexed position in Google's autocomplete list
      occurrences: number;
    }
  >();
  let completed = 0;
  const total = subqueries.length;

  for (let i = 0; i < subqueries.length; i += CONCURRENCY) {
    const batch = subqueries.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ({ query, source, category }) => {
        try {
          const suggestions = await fetchGoogleSuggestions({
            query,
            country: req.country,
            language: req.language,
            timeoutMs: 6000,
          });

          suggestions.forEach((kw, rank) => {
            const key = kw.toLowerCase();
            const existing = resultMap.get(key);
            if (existing) {
              existing.sources.add(source);
              existing.categories.add(category);
              existing.occurrences += 1;
              if (rank < existing.minRank) existing.minRank = rank;
            } else {
              resultMap.set(key, {
                keyword: kw,
                sources: new Set([source]),
                categories: new Set([category]),
                minRank: rank,
                occurrences: 1,
              });
            }
          });
        } catch {
          // If an individual subquery fails or is rate-limited, skip without manufacturing data
        } finally {
          completed++;
          if (onProgress) {
            onProgress(completed, total);
          }
        }
      })
    );

    if (i + CONCURRENCY < subqueries.length) {
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  // Calculate metrics and relative score based ONLY on actual returned data
  const maxOccurrences = Math.max(1, ...Array.from(resultMap.values()).map((v) => v.occurrences));
  
  const keywords: KeywordItem[] = Array.from(resultMap.values()).map((entry) => {
    const words = entry.keyword.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = entry.keyword.length;
    const ap = entry.minRank + 1; // 1-indexed Autocomplete Placement (1st, 2nd, ...)

    // Transparent Relative Score Calculation (0-100):
    // 60% weight from discovery frequency across subqueries, 40% weight from AP position
    const occurrenceFactor = (entry.occurrences / maxOccurrences) * 60;
    const rankFactor = Math.max(0, (15 - entry.minRank) / 15) * 40;
    const rawScore = occurrenceFactor + rankFactor;
    // Format to 2 decimal places or rounded cleanly
    const relativeScore = Number(Math.min(100, Math.max(1, rawScore)).toFixed(2));

    // Calculate Difficulty (Diff) based on competition level:
    // Higher AP (1-3) + shorter word count + high score = High competition / difficulty
    let diff: DifficultyLevel = 'Med';
    if (relativeScore >= 75 || (ap <= 2 && wordCount <= 2)) {
      diff = 'High';
    } else if (relativeScore < 45 || wordCount >= 5 || ap >= 8) {
      diff = 'Low';
    }

    // Calculate Hot status:
    // Hot keywords are the most popular / highest ranking terms in autocomplete (AP <= 3 or score >= 85)
    let hot: HotLevel = '-';
    if (relativeScore >= 90 || (ap === 1 && entry.sources.has('seed'))) {
      hot = 'Hottest keyword';
    } else if (relativeScore >= 70 || ap <= 3) {
      hot = 'Hot keyword';
    } else if (relativeScore >= 50) {
      hot = 'Trending';
    }

    const primaryCategory = Array.from(entry.categories)[0] || 'Google';

    return {
      keyword: entry.keyword,
      seedKeyword: seed,
      source: primaryCategory,
      country: req.country.toUpperCase(),
      ap,
      apFormatted: formatAp(ap),
      diff,
      hot,
      relativeScore,
      wordCount,
      charCount,
      sources: Array.from(entry.sources),
    };
  });

  // Default sort by relativeScore descending
  keywords.sort((a, b) => b.relativeScore - a.relativeScore);

  // Compute container summary metrics
  const totalKeywords = keywords.length;
  const hotKeywordsCount = keywords.filter((k) => k.hot === 'Hottest keyword' || k.hot === 'Hot keyword').length;
  const avgScore = totalKeywords > 0
    ? Number((keywords.reduce((acc, k) => acc + k.relativeScore, 0) / totalKeywords).toFixed(1))
    : 0;
  const avgAp = totalKeywords > 0
    ? Number((keywords.reduce((acc, k) => acc + k.ap, 0) / totalKeywords).toFixed(1))
    : 0;
  const apLte3Count = keywords.filter((k) => k.ap <= 3).length;
  
  const difficultyBreakdown = {
    low: keywords.filter((k) => k.diff === 'Low').length,
    med: keywords.filter((k) => k.diff === 'Med').length,
    high: keywords.filter((k) => k.diff === 'High').length,
  };

  return {
    keywords,
    metrics: {
      totalKeywords,
      hotKeywordsCount,
      avgScore,
      avgAp,
      apLte3Count,
      difficultyBreakdown,
      seedCount: 1,
    },
    totalQueriesExecuted: completed,
  };
}
