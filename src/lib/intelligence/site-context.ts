/**
 * Site Context & Knowledge Engine for Google Keyword Dominator
 * 
 * Extracts full situational context about any user website:
 * 1. Waterfall extraction: Jina Reader (fast, free) -> OpenRouter web_fetch (fallback)
 * 2. Recursive Sitemap.xml and sitemap_index.xml discovery
 * 3. Structured business & topical context profile for LLM prompt injection
 */

export interface SiteContextProfile {
  domain: string;
  normalizedUrl: string;
  siteName: string;
  businessType: string;
  targetAudience: string;
  primaryLocation?: string;
  coreServices: string[];
  topTopics: string[];
  situationalSummary: string;
  sitemapUrl?: string;
  discoveredUrlsCount: number;
  sampleSitemapUrls: string[];
  extractedVia: 'jina' | 'openrouter_web_fetch' | 'heuristics';
}

const OPENROUTER_MODEL = 'deepseek/deepseek-v4-flash-0731';

/**
 * 1. Fetch clean markdown via Jina Reader (Step 1 of Waterfall)
 */
async function fetchViaJinaReader(targetUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
      headers: {
        Accept: 'text/markdown',
        'User-Agent': 'GoogleKeywordDominator/1.0',
      },
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const text = await res.text();
    if (text.length < 200) return null;
    return text.slice(0, 15000);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 2. Fetch via OpenRouter web_fetch tool (Step 2 Fallback)
 */
async function fetchViaOpenRouterWebFetch(targetUrl: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://google-keyword-dominator.vercel.app',
        'X-Title': 'Google Keyword Dominator Site Context',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        tools: [
          {
            type: 'openrouter:web_fetch',
            parameters: {
              engine: 'auto',
              max_uses: 2,
            },
          },
        ],
        messages: [
          {
            role: 'system',
            content: 'You are an expert business analyst. Use web_fetch to read the website and extract its core business summary.',
          },
          {
            role: 'user',
            content: `Use web_fetch to read "${targetUrl}" and provide a 200-word overview of what this company does, its main services, and target audience.`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * 3. Discover and parse sitemap.xml with recursive sitemap index support (#6)
 */
export async function fetchSiteSitemapUrls(targetUrl: string): Promise<{ sitemapUrl?: string; urls: string[] }> {
  const cleanDomain = targetUrl.replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '');
  const candidateSitemaps = [
    `https://${cleanDomain}/sitemap.xml`,
    `https://${cleanDomain}/sitemap_index.xml`,
    `https://${cleanDomain}/wp-sitemap.xml`,
  ];

  const collectedUrls = new Set<string>();
  let verifiedSitemapUrl: string | undefined;

  for (const sitemapUrl of candidateSitemaps) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(sitemapUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        signal: controller.signal,
      });

      if (res.ok) {
        const xml = await res.text();
        verifiedSitemapUrl = sitemapUrl;

        // Check if this is a sitemap index containing sub-sitemaps
        const subSitemapMatches = Array.from(xml.matchAll(/<sitemap>\s*<loc>([\s\S]*?)<\/loc>/gi))
          .map((m) => m[1].trim())
          .filter((u) => u.startsWith('http'));

        if (subSitemapMatches.length > 0) {
          // Fetch the first 3 sub-sitemaps (e.g. post-sitemap, page-sitemap)
          const subPromises = subSitemapMatches.slice(0, 3).map(async (subUrl) => {
            try {
              const subRes = await fetch(subUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(4000),
              });
              if (subRes.ok) {
                const subXml = await subRes.text();
                const locs = Array.from(subXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)).map((m) => m[1].trim());
                locs.forEach((u) => {
                  if (u.startsWith('http') && !u.endsWith('.xml')) collectedUrls.add(u);
                });
              }
            } catch {
              // Ignore sub-sitemap fetch error
            }
          });
          await Promise.all(subPromises);
        } else {
          // Standard single sitemap
          const locMatches = Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi))
            .map((m) => m[1].trim())
            .filter((u) => u.startsWith('http') && !u.endsWith('.xml'));

          locMatches.forEach((u) => collectedUrls.add(u));
        }

        if (collectedUrls.size > 0) {
          clearTimeout(timeoutId);
          break;
        }
      }
    } catch {
      // Continue
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    sitemapUrl: verifiedSitemapUrl,
    urls: Array.from(collectedUrls).slice(0, 150),
  };
}

/**
 * Main Site Context Profile Generator
 */
export async function buildSiteContextProfile(inputUrl: string): Promise<SiteContextProfile> {
  let normalizedUrl = inputUrl.trim().replace(/^sc-domain:/i, '');
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const domain = normalizedUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  // 1. Discover Sitemap in parallel (including sub-sitemaps)
  const sitemapPromise = fetchSiteSitemapUrls(normalizedUrl);

  // 2. Waterfall Step 1: Jina Reader
  let rawContent = await fetchViaJinaReader(normalizedUrl);
  let extractionMethod: 'jina' | 'openrouter_web_fetch' | 'heuristics' = 'jina';

  // 3. Waterfall Step 2: OpenRouter web_fetch if Jina fails
  if (!rawContent || rawContent.length < 200) {
    rawContent = await fetchViaOpenRouterWebFetch(normalizedUrl);
    extractionMethod = 'openrouter_web_fetch';
  }

  const sitemapData = await sitemapPromise;

  // 4. Synthesize with DeepSeek into structured Context Profile
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey && rawContent) {
    try {
      const prompt = `Analyze this website content and build a structured business profile:

Website Domain: "${domain}"
Website Content Excerpt:
${rawContent.slice(0, 5000)}

Sample Sitemap URLs:
${sitemapData.urls.slice(0, 15).join('\n')}

Instructions:
Extract the exact business identity, what they do, who they serve, and main topics.

Return ONLY valid JSON matching this exact structure:
{
  "siteName": "Company or Brand Name",
  "businessType": "e.g. Local Plumbing Contractor, SaaS Platform, E-commerce Store",
  "targetAudience": "e.g. Homeowners in Austin TX, DevOps Engineers",
  "primaryLocation": "City, State or Country (if applicable, else Global)",
  "coreServices": ["Service 1", "Service 2", "Service 3"],
  "topTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "situationalSummary": "2-sentence clear situational summary describing what this business is and how content should be tailored for it."
}`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://google-keyword-dominator.vercel.app',
          'X-Title': 'Google Keyword Dominator',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: 'You are an expert SEO auditor. Always output pure valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          const parsed = JSON.parse(content.replace(/^```json\s*/i, '').replace(/\s*```$/i, ''));
          return {
            domain,
            normalizedUrl,
            siteName: parsed.siteName || domain,
            businessType: parsed.businessType || 'Website',
            targetAudience: parsed.targetAudience || 'General Audience',
            primaryLocation: parsed.primaryLocation,
            coreServices: parsed.coreServices || [],
            topTopics: parsed.topTopics || [],
            situationalSummary: parsed.situationalSummary || `Website targeting ${domain} industry search demand.`,
            sitemapUrl: sitemapData.sitemapUrl,
            discoveredUrlsCount: sitemapData.urls.length,
            sampleSitemapUrls: sitemapData.urls.slice(0, 10),
            extractedVia: extractionMethod,
          };
        }
      }
    } catch (err) {
      console.error('Failed to parse DeepSeek site context:', err);
    }
  }

  return {
    domain,
    normalizedUrl,
    siteName: domain.split('.')[0].toUpperCase(),
    businessType: 'Website / Brand',
    targetAudience: 'Organic Search Visitors',
    coreServices: [],
    topTopics: [domain.split('.')[0]],
    situationalSummary: `Website operates on ${domain} addressing relevant search demand.`,
    sitemapUrl: sitemapData.sitemapUrl,
    discoveredUrlsCount: sitemapData.urls.length,
    sampleSitemapUrls: sitemapData.urls.slice(0, 10),
    extractedVia: 'heuristics',
  };
}
