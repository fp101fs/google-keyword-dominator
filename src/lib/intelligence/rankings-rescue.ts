import { GscQueryItem } from '../gsc/types';
import { RankingsRescueTask } from './types';

/**
 * Rankings Rescue Engine:
 * Analyzes GSC performance data to detect:
 * 1. Striking Distance queries (Pos 11-20 with high impressions)
 * 2. High Impressions with low CTR (SERP snippet failure)
 * 3. Priority optimization tasks with 1-click prompts
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
        title: `Low CTR on Top-10 Query: "${q.query}"`,
        url: q.page || 'Target Page',
        query: q.query,
        impactMetrics: {
          impressions: q.impressions,
          clicks: q.clicks,
          position: q.position,
          ctr: q.ctr,
        },
        rootCause: `Ranking #${q.position} with ${q.impressions.toLocaleString()} impressions, but only generating ${(q.ctr * 100).toFixed(1)}% CTR. Your title/snippet is losing clicks to competitors.`,
        prescribedFix: `Rewrite the HTML <title> tag to front-load the keyword "${q.query}", and add emotional hooks or current year (2026).`,
        copyablePrompt: `Provide 5 high-CTR Title Tag and Meta Description variations for the URL "${q.page || 'this page'}". The primary keyword is "${q.query}", currently ranking at Position #${q.position} with ${q.impressions.toLocaleString()} impressions and ${(q.ctr * 100).toFixed(1)}% CTR.`,
      });
    }

    // 2. Striking Distance (Positions 11–20)
    if (q.position >= 11 && q.position <= 20 && q.impressions >= 400) {
      tasks.push({
        id: `rescue-pos-${idx}`,
        type: 'striking_distance',
        severity: q.impressions > 1500 ? 'high' : 'medium',
        title: `Page 2 Striking Opportunity: "${q.query}"`,
        url: q.page || 'Target Page',
        query: q.query,
        impactMetrics: {
          impressions: q.impressions,
          clicks: q.clicks,
          position: q.position,
          ctr: q.ctr,
        },
        rootCause: `Google already trusts your page for "${q.query}" at Position #${q.position}. It is on Page 2 and missing out on 90% of clicks.`,
        prescribedFix: `Add a dedicated H2 heading and 2-3 substantive paragraphs with bullet points answering "${q.query}".`,
        copyablePrompt: `Write a comprehensive, authoritative section (H2 + 250 words with actionable steps) to insert into "${q.page || 'this article'}" specifically targeting the query "${q.query}" to push the ranking from Position #${q.position} onto Page 1.`,
      });
    }
  });

  return tasks.sort((a, b) => {
    const sevScore = { high: 3, medium: 2, low: 1 };
    return sevScore[b.severity] * 10000 + b.impactMetrics.impressions - (sevScore[a.severity] * 10000 + a.impactMetrics.impressions);
  });
}
