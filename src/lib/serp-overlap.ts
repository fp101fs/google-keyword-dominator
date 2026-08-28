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

  // Regex to extract URL Source: <url> and corresponding Title: <title>
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

  // Fallback regex if split pattern differs
  if (results.length === 0) {
    const regex = /URL Source:\s*(https?:\/\/[^\s\n\r]+)/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const url = match[1].trim();
      if (!results.some((r) => r.url === url)) {
        results.push({
          title: url,
          url,
          domain: extractDomain(url),
        });
      }
    }
  }

  return results.slice(0, 10);
}

/**
 * Fetches genuine SERP results for a single query using Jina Search API
 */
export async function fetchSerpResults(
  query: string,
  apiKey: string = process.env.JINA_API_KEY || 'jina_dfd60e9498b74896b272f3fe3e940138FQUgfvNa96XX1Kpf5pJA7oqc9xRA'
): Promise<SerpResultItem[]> {
  try {
    const url = new URL(`https://s.jina.ai/${encodeURIComponent(query.trim())}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-No-Cache': 'true',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return [];
    }

    const text = await res.text();
    return parseJinaSearchResults(text);
  } catch {
    return [];
  }
}

/**
 * Computes the full NxN overlap matrix between a selected set of keywords (up to 8 keywords)
 */
export async function computeSerpOverlapMatrix(
  keywords: string[],
  apiKey?: string
): Promise<SerpOverlapMatrixData> {
  const selected = keywords.slice(0, 8);
  const serpMap: Record<string, SerpResultItem[]> = {};

  await Promise.all(
    selected.map(async (kw) => {
      serpMap[kw] = await fetchSerpResults(kw, apiKey);
    })
  );

  const n = selected.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const domainMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const topOverlaps: OverlapPair[] = [];
  const domainSet = new Set<string>();

  for (let i = 0; i < n; i++) {
    const kwA = selected[i];
    const resultsA = serpMap[kwA] || [];
    const urlsA = new Set(resultsA.map((r) => r.url));
    const domainsA = new Set(resultsA.map((r) => r.domain));

    resultsA.forEach((r) => domainSet.add(r.domain));

    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = resultsA.length;
        domainMatrix[i][j] = domainsA.size;
        continue;
      }

      const kwB = selected[j];
      const resultsB = serpMap[kwB] || [];
      const urlsB = new Set(resultsB.map((r) => r.url));
      const domainsB = new Set(resultsB.map((r) => r.domain));

      const sharedUrls = Array.from(urlsA).filter((u) => urlsB.has(u));
      const sharedDomains = Array.from(domainsA).filter((d) => domainsB.has(d));

      matrix[i][j] = sharedUrls.length;
      domainMatrix[i][j] = sharedDomains.length;

      if (i < j && (sharedUrls.length > 0 || sharedDomains.length > 0)) {
        const maxLen = Math.max(1, resultsA.length, resultsB.length);
        const pct = Math.round((sharedUrls.length / maxLen) * 100);
        topOverlaps.push({
          keywordA: kwA,
          keywordB: kwB,
          overlapCount: sharedUrls.length,
          overlapPercentage: pct,
          sharedUrls,
          sharedDomains,
        });
      }
    }
  }

  topOverlaps.sort((a, b) => b.overlapCount - a.overlapCount || b.overlapPercentage - a.overlapPercentage);

  return {
    keywords: selected,
    serpMap,
    matrix,
    domainMatrix,
    topOverlaps,
    allDomains: Array.from(domainSet).sort(),
  };
}
