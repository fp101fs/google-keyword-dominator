import { GscQueryItem, GscPageItem } from '../gsc/types';
import { GscGapOpportunity, OpportunityTier } from './types';
import { getExpandedKeywords } from '../autocomplete';

/**
 * Extract topic keywords from URL slugs (e.g. "/blog/best-ai-audio-to-video-tools" -> "ai audio to video tools")
 */
function extractTopicFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const clean = pathname
      .replace(/^\/(blog|articles|posts|p|guide|product)\//i, '')
      .replace(/\//g, ' ')
      .replace(/[-_]/g, ' ')
      .trim();

    if (!clean || clean.length < 3 || clean === 'dashboard' || clean === 'login' || clean === 'index') {
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
 * Computes GSC Gap Opportunities purely with real Google search data.
 */
export async function computeGscGapOpportunities(
  gscQueries: GscQueryItem[],
  gscPages: GscPageItem[] = [],
  country: string = 'US',
  language: string = 'en'
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

  // 2. Build intelligent seed list:
  const candidateSeeds = new Set<string>();

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

      expandedItems.forEach((item) => {
        const normKw = item.keyword.toLowerCase().trim();

        if (!isRelevantQueryExpansion(item.seedKeyword, item.keyword)) {
          return;
        }

        const existingGsc = gscQueryMap.get(normKw);

        if (existingGsc) {
          if (existingGsc.position >= 8 && existingGsc.position <= 25) {
            opportunities.push({
              query: item.keyword,
              sourceGscQuery: item.seedKeyword,
              tier: 'green_striking',
              tierLabel: 'Striking Distance (Pos 8-25)',
              tierBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              tierDescription: `Already ranking #${existingGsc.position} with ${existingGsc.impressions.toLocaleString()} impressions.`,
              impressions: existingGsc.impressions,
              clicks: existingGsc.clicks,
              position: existingGsc.position,
              ctr: existingGsc.ctr,
              page: existingGsc.page,
              autocompleteScore: item.relativeScore,
              recommendedAction: 'Page 1 Target',
            });
          } else if (existingGsc.impressions >= 100) {
            opportunities.push({
              query: item.keyword,
              sourceGscQuery: item.seedKeyword,
              tier: 'green_impressions',
              tierLabel: 'Google Associated Topic',
              tierBadgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
              tierDescription: `Google associates this query with your domain (${existingGsc.impressions.toLocaleString()} impressions).`,
              impressions: existingGsc.impressions,
              clicks: existingGsc.clicks,
              position: existingGsc.position,
              ctr: existingGsc.ctr,
              page: existingGsc.page,
              autocompleteScore: item.relativeScore,
              recommendedAction: 'Reinforce Topic',
            });
          }
        } else {
          // Top non-branded autocomplete demand (YELLOW TIER)
          if (item.relativeScore >= 60) {
            opportunities.push({
              query: item.keyword,
              sourceGscQuery: item.seedKeyword,
              tier: 'yellow_new_content',
              tierLabel: 'High Demand • Zero GSC Coverage',
              tierBadgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
              tierDescription: `High autocomplete search demand with 0 impressions on your site.`,
              impressions: 0,
              clicks: 0,
              position: 0,
              ctr: 0,
              autocompleteScore: item.relativeScore,
              recommendedAction: 'New Content Target',
            });
          }
        }
      });
    } catch (err) {
      console.error('Autocomplete expansion error for queries:', topSeeds, err);
    }
  }

  const seen = new Set<string>();
  const uniqueList = opportunities.filter((op) => {
    if (seen.has(op.query.toLowerCase())) return false;
    seen.add(op.query.toLowerCase());
    return true;
  });

  const tierWeight: Record<OpportunityTier, number> = {
    green_striking: 100,
    red_low_ctr: 85,
    green_impressions: 70,
    yellow_new_content: 60,
    orange_cannibalization: 50,
  };

  return uniqueList.sort((a, b) => {
    const scoreA = (tierWeight[a.tier] || 0) * 100 + a.impressions;
    const scoreB = (tierWeight[b.tier] || 0) * 100 + b.impressions;
    return scoreB - scoreA;
  });
}
