import { KeywordItem, normalizeKeyword } from './autocomplete';

export interface KeywordGapResult {
  targetSeed: string;
  competitorSeeds: string[];
  sharedKeywords: KeywordItem[];          // Exact phrase or semantic intersection
  gapOpportunities: KeywordItem[];        // Competitor terms missed by target
  uniqueStrengths: KeywordItem[];         // Target terms exclusive from competitors
  totalTargetKeywords: number;
  totalCompetitorKeywords: number;
  gapCoverageScore: number;              // % of competitor topical universe covered
}

/**
 * Normalizes keyword string into an array of meaningful word stems/tokens (ignoring common stopwords)
 */
function extractStemTokens(text: string): string[] {
  const stopwords = new Set(['a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is']);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopwords.has(w));
}

/**
 * Computes semantic topical overlap between two keyword lists:
 * 1. Exact phrase matches (e.g. `ai vs llm` in both)
 * 2. Shared core topical modifiers (e.g. `ai for coding` vs `llm for coding` -> `for coding`)
 * 3. Seed-cross occurrences (e.g. `ai` list contains `llm`, or `llm` list contains `ai`)
 */
export function computeContentGap(
  targetSeed: string,
  targetKeywords: KeywordItem[],
  competitorSeeds: string[],
  competitorKeywordsMap: Record<string, KeywordItem[]>
): KeywordGapResult {
  const normTarget = normalizeKeyword(targetSeed).toLowerCase();
  const targetSeedsSet = new Set([normTarget]);

  const competitorSeedsNorm = competitorSeeds.map((s) => normalizeKeyword(s).toLowerCase());
  const competitorSeedsSet = new Set(competitorSeedsNorm);

  const targetExactMap = new Map<string, KeywordItem>();
  targetKeywords.forEach((k) => targetExactMap.set(k.keyword.toLowerCase(), k));

  const allCompetitorKwsMap = new Map<string, KeywordItem>();
  Object.values(competitorKeywordsMap).forEach((list) => {
    list.forEach((k) => {
      allCompetitorKwsMap.set(k.keyword.toLowerCase(), k);
    });
  });

  // Build modifier/stem maps to detect topical intent overlap (e.g. "for coding", "benchmarks", "architecture")
  const targetModifierMap = new Map<string, KeywordItem>();
  targetKeywords.forEach((k) => {
    const stems = extractStemTokens(k.keyword).filter((t) => !targetSeedsSet.has(t));
    if (stems.length > 0) {
      const stemKey = stems.sort().join(' ');
      targetModifierMap.set(stemKey, k);
    }
  });

  const shared: KeywordItem[] = [];
  const gaps: KeywordItem[] = [];
  const unique: KeywordItem[] = [];
  const sharedKeysSet = new Set<string>();

  // 1. Check exact phrase overlap & competitor seed cross-mentions
  targetKeywords.forEach((k) => {
    const key = k.keyword.toLowerCase();

    // Check if exact phrase exists in competitor keywords
    if (allCompetitorKwsMap.has(key)) {
      shared.push(k);
      sharedKeysSet.add(key);
      return;
    }

    // Check if target keyword directly references one of the competitor seeds (e.g. "ai vs llm")
    const words = key.split(/\s+/);
    const mentionsCompetitor = competitorSeedsNorm.some((comp) => words.includes(comp));
    if (mentionsCompetitor) {
      shared.push(k);
      sharedKeysSet.add(key);
      return;
    }

    // Check if same underlying subtopic/intent modifier is targeted
    const stems = extractStemTokens(k.keyword).filter((t) => !targetSeedsSet.has(t));
    if (stems.length >= 2) {
      const stemKey = stems.sort().join(' ');
      if (targetModifierMap.has(stemKey)) {
        // Compare with competitor modifier map
        for (const compKw of allCompetitorKwsMap.values()) {
          const compStems = extractStemTokens(compKw.keyword).filter((t) => !competitorSeedsSet.has(t));
          if (compStems.length >= 2 && compStems.sort().join(' ') === stemKey) {
            shared.push(k);
            sharedKeysSet.add(key);
            return;
          }
        }
      }
    }

    unique.push(k);
  });

  // 2. Identify Missed Gaps from Competitor Keywords
  allCompetitorKwsMap.forEach((compKw, compKey) => {
    if (sharedKeysSet.has(compKey)) return;

    if (targetExactMap.has(compKey)) {
      if (!shared.some((s) => s.keyword.toLowerCase() === compKey)) {
        shared.push(compKw);
      }
      return;
    }

    const words = compKey.split(/\s+/);
    const mentionsTarget = words.includes(normTarget);
    if (mentionsTarget) {
      if (!shared.some((s) => s.keyword.toLowerCase() === compKey)) {
        shared.push(compKw);
      }
      return;
    }

    gaps.push(compKw);
  });

  // Sort by relative score
  shared.sort((a, b) => b.relativeScore - a.relativeScore);
  gaps.sort((a, b) => b.relativeScore - a.relativeScore);
  unique.sort((a, b) => b.relativeScore - a.relativeScore);

  const totalComp = allCompetitorKwsMap.size;
  const coverageScore = totalComp > 0 ? Math.min(100, Math.round((shared.length / (shared.length + gaps.length)) * 100)) : 100;

  return {
    targetSeed: normTarget,
    competitorSeeds: competitorSeeds.map(normalizeKeyword),
    sharedKeywords: shared,
    gapOpportunities: gaps,
    uniqueStrengths: unique,
    totalTargetKeywords: targetKeywords.length,
    totalCompetitorKeywords: totalComp,
    gapCoverageScore: coverageScore,
  };
}
