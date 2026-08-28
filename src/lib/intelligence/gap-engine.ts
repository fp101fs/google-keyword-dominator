import { GscQueryItem } from '../gsc/types';
import { GscGapOpportunity, OpportunityTier } from './types';
import { getExpandedKeywords } from '../autocomplete';

/**
 * Computes GSC Gap Opportunities:
 * Takes the top ranking GSC queries, runs genuine autocomplete expansion,
 * and categorizes every opportunity into actionable intelligence tiers.
 */
export async function computeGscGapOpportunities(
  gscQueries: GscQueryItem[],
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
        tierDescription: `Ranking #${q.position} with ${q.impressions.toLocaleString()} impressions, but only ${(q.ctr * 100).toFixed(1)}% CTR. Needs compelling Title & Meta CTA rewrite.`,
        impressions: q.impressions,
        clicks: q.clicks,
        position: q.position,
        ctr: q.ctr,
        page: q.page,
        autocompleteScore: 90,
        recommendedAction: 'Rewrite Title / Meta',
        actionPromptTemplate: `Rewrite the <title> tag and <meta name="description"> for "${q.page || 'this page'}" to target the primary query "${q.query}". Make it click-worthy with strong intent match to increase organic CTR from ${(q.ctr * 100).toFixed(1)}%.`,
      });
    }
  });

  // 2. Select top 5 high-traffic GSC queries to expand through Autocomplete
  const topSeeds = gscQueries.slice(0, 5).map((q) => q.query);

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
        const existingGsc = gscQueryMap.get(normKw);

        if (existingGsc) {
          // Already ranking in GSC
          if (existingGsc.position >= 8 && existingGsc.position <= 25) {
            opportunities.push({
              query: item.keyword,
              sourceGscQuery: item.seedKeyword,
              tier: 'green_striking',
              tierLabel: 'Striking Distance (Pos 8-25)',
              tierBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              tierDescription: `Already ranking #${existingGsc.position} with ${existingGsc.impressions.toLocaleString()} impressions. Add dedicated H2 section to jump to Page 1.`,
              impressions: existingGsc.impressions,
              clicks: existingGsc.clicks,
              position: existingGsc.position,
              ctr: existingGsc.ctr,
              page: existingGsc.page,
              autocompleteScore: item.relativeScore,
              recommendedAction: item.intent === 'informational' ? 'Add FAQ Schema' : 'Add H2 / Missing Section',
              actionPromptTemplate: `Add a dedicated H2 section or FAQ answer targeting "${item.keyword}" on the page "${existingGsc.page || 'this page'}". The query already ranks #${existingGsc.position} on Google.`,
            });
          } else if (existingGsc.impressions >= 100) {
            opportunities.push({
              query: item.keyword,
              sourceGscQuery: item.seedKeyword,
              tier: 'green_impressions',
              tierLabel: 'Google Associated Topic',
              tierBadgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
              tierDescription: `Google already associates your site with this topic (${existingGsc.impressions.toLocaleString()} impressions at Pos #${existingGsc.position}).`,
              impressions: existingGsc.impressions,
              clicks: existingGsc.clicks,
              position: existingGsc.position,
              ctr: existingGsc.ctr,
              page: existingGsc.page,
              autocompleteScore: item.relativeScore,
              recommendedAction: 'Add H2 / Missing Section',
              actionPromptTemplate: `Expand the topic "${item.keyword}" on "${existingGsc.page || 'this page'}" to reinforce Google's topical relevance.`,
            });
          }
        } else {
          // Top autocomplete demand NOT currently ranking in GSC (YELLOW TIER)
          if (item.relativeScore >= 65) {
            opportunities.push({
              query: item.keyword,
              sourceGscQuery: item.seedKeyword,
              tier: 'yellow_new_content',
              tierLabel: 'High Demand • Zero GSC Coverage',
              tierBadgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
              tierDescription: `High autocomplete demand around "${item.seedKeyword}" that your site has 0 impressions for. Ideal candidate for new spin-off article.`,
              impressions: 0,
              clicks: 0,
              position: 0,
              ctr: 0,
              autocompleteScore: item.relativeScore,
              recommendedAction: 'Create New Article',
              actionPromptTemplate: `Create a comprehensive new article targeting "${item.keyword}" as a supporting cluster page linking back to your main topic hub.`,
            });
          }
        }
      });
    } catch (err) {
      console.error('Autocomplete expansion error for queries:', topSeeds, err);
    }
  }

  // Deduplicate and sort by priority score
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
