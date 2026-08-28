import { GscQueryItem } from '../gsc/types';
import { PageExpansionPlan } from './types';
import { getExpandedKeywords } from '../autocomplete';

/**
 * Builds an Existing-Page Expansion Plan:
 * Takes any URL from GSC, extracts all queries generating impressions for it,
 * runs autocomplete expansion around them, and identifies the exact missing
 * H2 sections and real Google question queries.
 */
export async function buildPageExpansionPlan(
  pageUrl: string,
  pageQueries: GscQueryItem[],
  country: string = 'US',
  language: string = 'en'
): Promise<PageExpansionPlan> {
  const totalImp = pageQueries.reduce((s, q) => s + q.impressions, 0);
  const totalClicks = pageQueries.reduce((s, q) => s + q.clicks, 0);
  const avgPos = pageQueries.length > 0
    ? Number((pageQueries.reduce((s, q) => s + q.position, 0) / pageQueries.length).toFixed(1))
    : 0;

  // Find top seed query for this page
  const topQuery = pageQueries.sort((a, b) => b.impressions - a.impressions)[0]?.query || '';

  // Expand top query via genuine autocomplete
  let missingSubtopics: PageExpansionPlan['missingSubtopics'] = [];
  if (topQuery) {
    try {
      const { keywords: autocompleteList } = await getExpandedKeywords({
        seeds: [topQuery],
        country,
        language,
        platform: 'google',
        includeAlphabet: true,
        includeQuestions: true,
        includePrepositions: true,
      });

      const currentQuerySet = new Set(pageQueries.map((q) => q.query.toLowerCase().trim()));

      missingSubtopics = autocompleteList
        .filter((item) => !currentQuerySet.has(item.keyword.toLowerCase().trim()))
        .slice(0, 8)
        .map((item) => {
          const isQuestion = item.intent === 'informational' && /^(how|what|why|can|is|are|where)/i.test(item.keyword);
          return {
            title: item.keyword,
            targetQuery: item.keyword,
            intent: item.intent,
            relevanceScore: item.relativeScore,
            suggestedHeading: item.keyword,
            type: isQuestion ? 'faq' : item.relativeScore >= 80 ? 'section' : 'supporting_article',
          };
        });
    } catch (err) {
      console.error('Error expanding page queries:', err);
    }
  }

  return {
    pageUrl,
    totalImpressions: totalImp,
    totalClicks,
    avgPosition: avgPos,
    currentQueries: pageQueries.slice(0, 15),
    missingSubtopics,
  };
}
