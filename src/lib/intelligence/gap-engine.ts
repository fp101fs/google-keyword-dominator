import { GscQueryItem, GscPageItem } from '../gsc/types';
import { GscGapOpportunity, OpportunityTier } from './types';
import { getExpandedKeywords } from '../autocomplete';
import { fetchSiteSitemapUrls } from './site-context';

/**
 * Extract topic keywords from URL slugs (e.g. "/blog/best-ai-audio-to-video-tools" -> "ai audio to video tools")
 */
function extractTopicFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const clean = pathname
      .replace(/^\/(blog|articles|posts|p|guide|product|compare)\//i, '')
      .replace(/\//g, ' ')
      .replace(/[-_]/g, ' ')
      .trim();

    if (!clean || clean.length < 3 || clean === 'dashboard' || clean === 'login' || clean === 'index' || clean === 'pricing') {
      return null;
    }

    const topic = clean
      .replace(/\b(best|top|202[0-9]|guide|review|how to)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return topic.length >= 3 ? topic : clean;
  } catch {
    return null;
  }
}

/**
 * Filter out brand typos, fuzzy partial word collisions
 */
function isRelevantQueryExpansion(seed: string, suggestion: string): boolean {
  const normSeed = seed.toLowerCase().trim();
  const normSug = suggestion.toLowerCase().trim();

  if (normSeed === normSug) return false;

  const seedTokens = normSeed.split(/\s+/).filter(Boolean);
  const sugTokens = normSug.split(/\s+/).filter(Boolean);

  if (seedTokens.length > 1) {
    const matchCount = seedTokens.filter((token) => normSug.includes(token)).length;
    return matchCount >= Math.ceil(seedTokens.length * 0.6);
  }

  const singleToken = seedTokens[0];
  if (!singleToken) return false;

  const hasExactWord = sugTokens.some((t) => t === singleToken);
  if (hasExactWord) return true;

  if (normSug.startsWith(singleToken + ' ') || normSug.endsWith(' ' + singleToken)) {
    return true;
  }

  return false;
}

/**
 * Computes GSC Gap Opportunities purely with real Google search data & sitemap intelligence.
 */
export async function computeGscGapOpportunities(
  gscQueries: GscQueryItem[],
  gscPages: GscPageItem[] = [],
  country: string = 'US',
  language: string = 'en',
  siteUrl?: string
): Promise<GscGapOpportunity[]> {
  const opportunities: GscGapOpportunity[] = [];
  const gscQueryMap = new Map<string, GscQueryItem>();
  gscQueries.forEach((q) => gscQueryMap.set(q.query.toLowerCase().trim(), q));

  // 1. Process GSC queries with high impressions + poor CTR (RED TIER)
  gscQueries.forEach((q) => {
    if (q.position <= 10 && q.impressions >= 500 && q.ctr < 0.025) {
      opportunities.push({
        query: q.query,
        sourceGscQuery: q.query,
        tier: 'red_low_ctr',
        tierLabel: 'High Impressions + Low CTR',
        tierBadgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        tierDescription: `Ranking #${q.position} with ${q.impressions.toLocaleString()} impressions and ${(q.ctr * 100).toFixed(1)}% CTR.`,
        impressions: q.impressions,
        clicks: q.clicks,
        position: q.position,
        ctr: q.ctr,
        page: q.page,
        autocompleteScore: 90,
        recommendedAction: 'Optimize CTR',
      });
    }
  });

  // 2. Discover Sitemap URLs for fresh / new websites to extract topic seeds
  const candidateSeeds = new Set<string>();

  if (siteUrl && siteUrl.trim()) {
    try {
      const sitemap = await fetchSiteSitemapUrls(siteUrl);
      sitemap.urls.forEach((u) => {
        const topic = extractTopicFromUrl(u);
        if (topic) candidateSeeds.add(topic);
      });
    } catch {
      // Non-blocking fallback
    }
  }

  gscQueries.forEach((q) => {
    const trimmed = q.query.trim();
    if (trimmed.includes(' ') || q.impressions >= 100) {
      candidateSeeds.add(trimmed);
    }
  });

  gscPages.forEach((p) => {
    const slugTopic = extractTopicFromUrl(p.url);
    if (slugTopic) {
      candidateSeeds.add(slugTopic);
    }
  });

  if (candidateSeeds.size === 0 && gscQueries.length > 0) {
    gscQueries.slice(0, 3).forEach((q) => candidateSeeds.add(q.query));
  }

  const topSeeds = Array.from(candidateSeeds).slice(0, 6);

  if (topSeeds.length > 0) {
    try {
      const { keywords: expandedItems } = await getExpandedKeywords({
        seeds: topSeeds,
        country,
        language,
        platform: 'google',
        includeAlphabet: true,
        includeQuestions: true,
        includePrepositions: true,
      });

      for (const item of expandedItems) {
        const sugQuery = item.keyword.trim();
        const normSug = sugQuery.toLowerCase();

        if (opportunities.some((o) => o.query.toLowerCase() === normSug)) {
          continue;
        }

        const sourceSeed = item.seedKeyword || topSeeds[0];
        if (!isRelevantQueryExpansion(sourceSeed, sugQuery)) {
          continue;
        }

        const exactGscMatch = gscQueryMap.get(normSug);

        if (exactGscMatch) {
          if (exactGscMatch.position >= 10 && exactGscMatch.position <= 20) {
            opportunities.push({
              query: exactGscMatch.query,
              sourceGscQuery: sourceSeed,
              tier: 'green_striking',
              tierLabel: 'Page 2 Striking Distance (Pos 11-20)',
              tierBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              tierDescription: `Already ranking #${exactGscMatch.position.toFixed(1)} with ${exactGscMatch.impressions.toLocaleString()} impressions. Add dedicated H2 section or improve content depth to break onto Page 1.`,
              impressions: exactGscMatch.impressions,
              clicks: exactGscMatch.clicks,
              position: exactGscMatch.position,
              ctr: exactGscMatch.ctr,
              page: exactGscMatch.page,
              autocompleteScore: item.relativeScore,
              recommendedAction: 'Add H2 Section / Refresh Content',
            });
          } else if (exactGscMatch.impressions >= 1000 && exactGscMatch.position > 20) {
            opportunities.push({
              query: exactGscMatch.query,
              sourceGscQuery: sourceSeed,
              tier: 'green_impressions',
              tierLabel: 'High Demand Keyword (1,000+ Imp)',
              tierBadgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
              tierDescription: `High search volume (${exactGscMatch.impressions.toLocaleString()} impressions) ranking #${exactGscMatch.position.toFixed(1)}.`,
              impressions: exactGscMatch.impressions,
              clicks: exactGscMatch.clicks,
              position: exactGscMatch.position,
              ctr: exactGscMatch.ctr,
              page: exactGscMatch.page,
              autocompleteScore: item.relativeScore,
              recommendedAction: 'Build Dedicated Supporting Page',
            });
          }
        } else {
          // Autocomplete suggestion NOT in GSC (New topic demand)
          if (item.relativeScore >= 50 && item.ap <= 6) {
            opportunities.push({
              query: sugQuery,
              sourceGscQuery: sourceSeed,
              tier: 'yellow_new_content',
              tierLabel: 'New Content Opportunity (0 GSC Footprint)',
              tierBadgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
              tierDescription: `Google users are actively typing "${sugQuery}" (${item.apFormatted} AP suggestion rank), but your domain has 0 search impressions.`,
              impressions: 0,
              clicks: 0,
              position: 0,
              ctr: 0,
              autocompleteScore: item.relativeScore,
              recommendedAction: 'Write New Article / Target Seed',
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to compute expanded GSC gaps:', err);
    }
  }

  // Deduplicate and rank
  const tierWeight: Record<OpportunityTier, number> = {
    green_striking: 50,
    green_impressions: 40,
    red_low_ctr: 30,
    yellow_new_content: 20,
    orange_cannibalization: 10,
  };

  return opportunities
    .sort((a, b) => {
      const weightA = tierWeight[a.tier] || 0;
      const weightB = tierWeight[b.tier] || 0;
      if (weightA !== weightB) return weightB - weightA;
      return b.autocompleteScore - a.autocompleteScore;
    })
    .slice(0, 50);
}
