import { GscQueryItem } from '../gsc/types';
import { RankingsRescueTask } from './types';

/**
 * Rankings Rescue Engine:
 * Analyzes GSC performance data to detect:
 * 1. Striking Distance queries (Pos 11-20 with high impressions)
 * 2. High Impressions with low CTR (SERP snippet failure)
 */
export function computeRankingsRescueTasks(
  gscQueries: GscQueryItem[]
): RankingsRescueTask[] {
  const tasks: RankingsRescueTask[] = [];

  gscQueries.forEach((q, idx) => {
    // 1. High Impressions & Low CTR
    if (q.impressions >= 800 && q.position <= 10 && q.ctr < 0.02) {
      tasks.push({
        id: `rescue-ctr-${idx}`,
        type: 'low_ctr',
        severity: 'high',
        title: `Low CTR on Top 10 Query: "${q.query}"`,
        url: q.page || '',
        query: q.query,
        impactMetrics: {
          impressions: q.impressions,
          clicks: q.clicks,
          position: q.position,
          ctr: q.ctr,
        },
        rootCause: `Ranking #${q.position} with ${q.impressions.toLocaleString()} impressions and ${(q.ctr * 100).toFixed(1)}% CTR.`,
        prescribedFix: `Optimize page title and snippet to match user intent for "${q.query}".`,
      });
    }

    // 2. Striking Distance (Positions 11–20)
    if (q.position >= 11 && q.position <= 20 && q.impressions >= 400) {
      tasks.push({
        id: `rescue-pos-${idx}`,
        type: 'striking_distance',
        severity: q.impressions > 1500 ? 'high' : 'medium',
        title: `Page 2 Striking Distance: "${q.query}"`,
        url: q.page || '',
        query: q.query,
        impactMetrics: {
          impressions: q.impressions,
          clicks: q.clicks,
          position: q.position,
          ctr: q.ctr,
        },
        rootCause: `Ranking on Page 2 at Position #${q.position} with ${q.impressions.toLocaleString()} impressions.`,
        prescribedFix: `Add comprehensive content covering "${q.query}" to move onto Page 1.`,
      });
    }
  });

  return tasks.sort((a, b) => {
    const sevScore = { high: 3, medium: 2, low: 1 };
    return sevScore[b.severity] * 10000 + b.impactMetrics.impressions - (sevScore[a.severity] * 10000 + a.impactMetrics.impressions);
  });
}
