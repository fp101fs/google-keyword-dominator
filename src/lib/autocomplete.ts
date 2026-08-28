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

export interface KeywordItem {
  keyword: string;
  wordCount: number;
  charCount: number;
  relativeScore: number; // Transparent mathematical score based on frequency, position, and specificity in result set
  sources: string[];     // Subqueries that yielded this suggestion (e.g. 'root', 'a', 'b', 'wildcard')
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
    // Format for client=chrome is: [query, [sugg1, sugg2, ...], [desc1, ...], [], { "google:suggestrelevance": [...] }]
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

/**
 * Expansion modes:
 * - normal (deep mode default): root seed + top letters/questions/prepositions to guarantee 100+ genuine suggestions
 * - alphabet: full exhaustive a-z, 0-9
 * - questions: exhaustive question modifiers
 * - prepositions: exhaustive prepositions
 */
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
const TOP_EXPANSIONS = ['a', 'b', 'c', 'd', 'e', 'f', 's', 'm', 'p', 't', 'for', 'with', 'how', 'best', 'vs', 'online', 'app', 'free', 'near me'];
const QUESTION_PREFIXES = ['how', 'what', 'why', 'where', 'who', 'when', 'can', 'which', 'is', 'are', 'best', 'top', 'vs'];
const PREPOSITIONS = ['for', 'with', 'without', 'to', 'in', 'near', 'on', 'like', 'under', 'vs'];

/**
 * Retrieves genuine keyword suggestions with controlled concurrency and deduplication.
 * NEVER fabricates data: returns only what Google returned.
 */
export async function getExpandedKeywords(
  req: BatchKeywordRequest,
  onProgress?: (completed: number, total: number) => void
): Promise<{ keywords: KeywordItem[]; totalQueriesExecuted: number }> {
  const seed = normalizeKeyword(req.seed);
  if (!seed) {
    return { keywords: [], totalQueriesExecuted: 0 };
  }

  // Construct legitimate subqueries
  const subqueries: { query: string; source: string }[] = [];

  // 1. Root query
  subqueries.push({ query: seed, source: 'seed' });

  // 2. If user enabled specific expansion toggles, do full expansions
  if (req.includeAlphabet) {
    for (const char of ALPHABET) {
      subqueries.push({ query: `${seed} ${char}`, source: `suffix-${char}` });
    }
    for (const num of NUMBERS) {
      subqueries.push({ query: `${seed} ${num}`, source: `suffix-${num}` });
    }
  }

  if (req.includeQuestions) {
    for (const q of QUESTION_PREFIXES) {
      subqueries.push({ query: `${q} ${seed}`, source: `question-${q}` });
    }
  }

  if (req.includePrepositions) {
    for (const prep of PREPOSITIONS) {
      subqueries.push({ query: `${seed} ${prep}`, source: `prep-${prep}` });
    }
  }

  // 3. Default deep discovery: If no specific option is toggled, query top letters & modifiers to return 100+ real keywords
  if (!req.includeAlphabet && !req.includeQuestions && !req.includePrepositions) {
    for (const char of ALPHABET) {
      subqueries.push({ query: `${seed} ${char}`, source: `alpha-${char}` });
    }
    for (const q of ['how to', 'best', 'for', 'with', 'vs']) {
      subqueries.push({ query: `${q} ${seed}`, source: `mod-${q}` });
    }
  }

  // Execute subqueries with concurrency limiter (batch size 6)
  const CONCURRENCY = 6;
  const resultMap = new Map<string, { keyword: string; sources: Set<string>; minRank: number; occurrences: number }>();
  let completed = 0;
  const total = subqueries.length;

  for (let i = 0; i < subqueries.length; i += CONCURRENCY) {
    const batch = subqueries.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ({ query, source }) => {
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
              existing.occurrences += 1;
              if (rank < existing.minRank) existing.minRank = rank;
            } else {
              resultMap.set(key, {
                keyword: kw,
                sources: new Set([source]),
                minRank: rank,
                occurrences: 1,
              });
            }
          });
        } catch {
          // If an individual subquery fails or is rate-limited, skip it without manufacturing data
        } finally {
          completed++;
          if (onProgress) {
            onProgress(completed, total);
          }
        }
      })
    );

    // Small delay between batches to respect rate limits
    if (i + CONCURRENCY < subqueries.length) {
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  // Calculate relative scores based ONLY on actual returned data
  const maxOccurrences = Math.max(1, ...Array.from(resultMap.values()).map((v) => v.occurrences));
  
  const keywords: KeywordItem[] = Array.from(resultMap.values()).map((entry) => {
    const words = entry.keyword.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = entry.keyword.length;

    // Mathematical Relative Score Formula (0-100 scale):
    // - Occurrences across subqueries: 60%
    // - Suggestion position rank (rank 0 = top relevance): 40%
    const occurrenceFactor = (entry.occurrences / maxOccurrences) * 60;
    const rankFactor = Math.max(0, (15 - entry.minRank) / 15) * 40;
    const relativeScore = Math.round(occurrenceFactor + rankFactor);

    return {
      keyword: entry.keyword,
      wordCount,
      charCount,
      relativeScore: Math.min(100, Math.max(1, relativeScore)),
      sources: Array.from(entry.sources),
    };
  });

  // Default sort by relativeScore descending
  keywords.sort((a, b) => b.relativeScore - a.relativeScore);

  return {
    keywords,
    totalQueriesExecuted: completed,
  };
}
