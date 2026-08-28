export interface SerpResultItem {
  title: string;
  url: string;
  domain: string;
}

export interface KeywordSerpData {
  keyword: string;
  results: SerpResultItem[];
}

export interface OverlapPair {
  keywordA: string;
  keywordB: string;
  overlapCount: number;
  overlapPercentage: number;
  sharedUrls: string[];
  sharedDomains: string[];
}

export interface SerpOverlapMatrixData {
  keywords: string[];
  serpMap: Record<string, SerpResultItem[]>;
  matrix: number[][]; // [i][j] = shared URL count
  domainMatrix: number[][]; // [i][j] = shared Domain count
  topOverlaps: OverlapPair[];
  allDomains: string[];
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Parses markdown output from Jina Search (e.g. `[1] Title: ...\n[1] URL Source: ...`)
 */
export function parseJinaSearchResults(text: string): SerpResultItem[] {
  const results: SerpResultItem[] = [];
  if (!text) return results;

  const blocks = text.split(/\[\d+\] Title:/i);

  for (const block of blocks) {
    if (!block.trim()) continue;

    const urlMatch = block.match(/URL Source:\s*(https?:\/\/[^\s\n\r]+)/i);
    if (urlMatch && urlMatch[1]) {
      const url = urlMatch[1].trim();
      const firstLine = block.split('\n')[0].trim();
      const title = firstLine || url;
      const domain = extractDomain(url);

      if (!results.some((r) => r.url === url)) {
        results.push({ title, url, domain });
      }
    }
  }

  return results.slice(0, 10);
}

/**
 * Fallback via OpenRouter web_search if Jina is unavailable or rate-limited
 */
async function fetchSerpViaOpenRouter(keyword: string): Promise<SerpResultItem[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://google-keyword-dominator.vercel.app',
        'X-Title': 'Google Keyword Dominator SERP Overlap',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v4-flash-0731',
        tools: [
          {
            type: 'openrouter:web_search',
            parameters: { engine: 'auto', max_results: 10 },
          },
        ],
        messages: [
          {
            role: 'system',
            content: 'You are a search scraper. Search Google for the given keyword and return the top 10 search results as pure JSON: [{"title": "...", "url": "..."}]',
          },
          { role: 'user', content: `Search Google for "${keyword}".` },
        ],
        temperature: 0.1,
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return [];

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { title: string; url: string }[];
      return parsed.map((item) => ({
        title: item.title,
        url: item.url,
        domain: extractDomain(item.url),
      })).slice(0, 10);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Fetch top 10 search results for a keyword with 2-step waterfall: Jina -> OpenRouter web_search
 */
export async function fetchSerpResults(keyword: string): Promise<SerpResultItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const cleanKeyword = encodeURIComponent(keyword.trim());
    const res = await fetch(`https://s.jina.ai/${cleanKeyword}`, {
      headers: {
        Accept: 'text/markdown',
        'User-Agent': 'GoogleKeywordDominator/1.0',
      },
      signal: controller.signal,
    });

    if (res.ok) {
      const text = await res.text();
      const results = parseJinaSearchResults(text);
      if (results.length > 0) {
        clearTimeout(timeoutId);
        return results;
      }
    }
  } catch {
    // Proceed to OpenRouter fallback
  } finally {
    clearTimeout(timeoutId);
  }

  // Step 2: Fallback to OpenRouter web_search
  return await fetchSerpViaOpenRouter(keyword);
}

/**
 * Calculates URL and Domain overlap between all keyword pairs.
 */
export function computeSerpOverlap(keywordsSerpData: KeywordSerpData[]): SerpOverlapMatrixData {
  const keywords = keywordsSerpData.map((d) => d.keyword);
  const serpMap: Record<string, SerpResultItem[]> = {};
  const allDomainsSet = new Set<string>();

  keywordsSerpData.forEach((item) => {
    serpMap[item.keyword] = item.results;
    item.results.forEach((r) => allDomainsSet.add(r.domain));
  });

  const n = keywords.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const domainMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const topOverlaps: OverlapPair[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = serpMap[keywords[i]]?.length || 0;
        domainMatrix[i][j] = new Set(serpMap[keywords[i]]?.map((r) => r.domain)).size;
        continue;
      }

      const resultsA = serpMap[keywords[i]] || [];
      const resultsB = serpMap[keywords[j]] || [];

      const urlsA = new Set(resultsA.map((r) => r.url.toLowerCase()));
      const sharedUrls = resultsB.filter((r) => urlsA.has(r.url.toLowerCase())).map((r) => r.url);

      const domainsA = new Set(resultsA.map((r) => r.domain.toLowerCase()));
      const sharedDomains = Array.from(
        new Set(resultsB.filter((r) => domainsA.has(r.domain.toLowerCase())).map((r) => r.domain))
      );

      matrix[i][j] = sharedUrls.length;
      domainMatrix[i][j] = sharedDomains.length;

      if (i < j) {
        const totalDistinctUrls = new Set([...resultsA.map((r) => r.url), ...resultsB.map((r) => r.url)]).size;
        const overlapPercentage = totalDistinctUrls > 0 ? Math.round((sharedUrls.length / 10) * 100) : 0;

        topOverlaps.push({
          keywordA: keywords[i],
          keywordB: keywords[j],
          overlapCount: sharedUrls.length,
          overlapPercentage,
          sharedUrls,
          sharedDomains,
        });
      }
    }
  }

  topOverlaps.sort((a, b) => b.overlapCount - a.overlapCount);

  return {
    keywords,
    serpMap,
    matrix,
    domainMatrix,
    topOverlaps,
    allDomains: Array.from(allDomainsSet),
  };
}

/**
 * End-to-end matrix computation for route.ts
 */
export async function computeSerpOverlapMatrix(
  keywords: string[],
  _apiKey?: string
): Promise<SerpOverlapMatrixData> {
  const serpDataPromises = keywords.map(async (kw) => {
    const results = await fetchSerpResults(kw);
    return { keyword: kw, results };
  });

  const keywordsSerpData = await Promise.all(serpDataPromises);
  return computeSerpOverlap(keywordsSerpData);
}
