import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { getGscPropertySnapshot } from '@/lib/gsc/gsc-service';
import { getGscDemoSnapshot } from '@/lib/gsc/demo-data';
import { computeRankingsRescueTasks } from '@/lib/intelligence/rankings-rescue';
import { generateLlmRankingsRescue } from '@/lib/llm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteUrl, isDemo } = body;

    let snapshot;
    if (isDemo || !siteUrl) {
      snapshot = getGscDemoSnapshot();
    } else {
      const token = await getValidAccessToken();
      if (!token) {
        snapshot = getGscDemoSnapshot();
      } else {
        snapshot = await getGscPropertySnapshot(token, siteUrl);
      }
    }

    const tasks = computeRankingsRescueTasks(snapshot.queries || []);

    // Enhance top 3 highest impact rescue tasks with LLM editorial prescriptions
    const enhancedTasks = await Promise.all(
      tasks.map(async (task, idx) => {
        if (idx < 3) {
          const llmFix = await generateLlmRankingsRescue(
            task.query,
            task.url,
            task.impactMetrics.impressions,
            task.impactMetrics.position,
            task.impactMetrics.ctr,
            task.type === 'low_ctr' ? 'low_ctr' : 'striking_distance'
          );
          if (llmFix) {
            return {
              ...task,
              prescribedFix: llmFix.prescribedFix,
            };
          }
        }
        return task;
      })
    );

    return NextResponse.json({
      success: true,
      property: snapshot.property,
      totalQueries: snapshot.queries.length,
      tasks: enhancedTasks,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to analyze rankings rescue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
