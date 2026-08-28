import { KeywordItem, normalizeKeyword } from './autocomplete';

export interface KeywordGapResult {
  targetSeed: string;
  competitorSeeds: string[];
  sharedKeywords: KeywordItem[];       // Keywords present in both Target & Competitors
  gapOpportunities: KeywordItem[];     // Keywords present in Competitors but MISSED by Target
  uniqueStrengths: KeywordItem[];      // Keywords present in Target but not in Competitors
  totalTargetKeywords: number;
  totalCompetitorKeywords: number;
  gapCoverageScore: number;           // % of competitor keyword universe you also cover
}

export function computeContentGap(
  targetSeed: string,
  targetKeywords: KeywordItem[],
  competitorSeeds: string[],
  competitorKeywordsMap: Record<string, KeywordItem[]>
): KeywordGapResult {
  const normTarget = normalizeKeyword(targetSeed).toLowerCase();
  const targetMap = new Map<string, KeywordItem>();
  targetKeywords.forEach((k) => targetMap.set(k.keyword.toLowerCase(), k));

  const allCompetitorKwsMap = new Map<string, KeywordItem>();
  Object.values(competitorKeywordsMap).forEach((list) => {
    list.forEach((k) => {
      allCompetitorKwsMap.set(k.keyword.toLowerCase(), k);
    });
  });

  const shared: KeywordItem[] = [];
  const gaps: KeywordItem[] = [];
  const unique: KeywordItem[] = [];

  // Check target against competitor universe
  targetKeywords.forEach((k) => {
    const key = k.keyword.toLowerCase();
    if (allCompetitorKwsMap.has(key)) {
      shared.push(k);
    } else {
      unique.push(k);
    }
  });

  // Find missed opportunities in competitor universe
  allCompetitorKwsMap.forEach((k, key) => {
    if (!targetMap.has(key)) {
      gaps.push(k);
    }
  });

  // Sort by relative score
  shared.sort((a, b) => b.relativeScore - a.relativeScore);
  gaps.sort((a, b) => b.relativeScore - a.relativeScore);
  unique.sort((a, b) => b.relativeScore - a.relativeScore);

  const totalComp = allCompetitorKwsMap.size;
  const gapCoverage = totalComp > 0 ? Math.round((shared.length / totalComp) * 100) : 100;

  return {
    targetSeed: normTarget,
    competitorSeeds: competitorSeeds.map(normalizeKeyword),
    sharedKeywords: shared,
    gapOpportunities: gaps,
    uniqueStrengths: unique,
    totalTargetKeywords: targetKeywords.length,
    totalCompetitorKeywords: totalComp,
    gapCoverageScore: gapCoverage,
  };
}
