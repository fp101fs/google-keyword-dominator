import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { getGscPropertySnapshot } from '@/lib/gsc/gsc-service';
import { getGscDemoSnapshot } from '@/lib/gsc/demo-data';
import { computeRankingsRescueTasks } from '@/lib/intelligence/rankings-rescue';
import { generateOpenRouterRawText } from '@/lib/llm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

    // Enhance top rescue tasks with DeepSeek LLM editorial prescriptions
    const candidateTasks = tasks.slice(0, 10);
    
    if (process.env.OPENROUTER_API_KEY && candidateTasks.length > 0) {
      try {
        const prompt = `You are a premier SEO search strategist.
Below is a list of underperforming search queries that are either stuck on Page 2 or suffering from low CTR in the Top 10 on Google:

${candidateTasks.map((t, i) => `${i + 1}. Query: "${t.query}" | Page: "${t.url || 'N/A'}" | Position: #${t.impactMetrics.position} | Impressions: ${t.impactMetrics.impressions.toLocaleString()} | Type: ${t.type}`).join('\n')}

For EACH query, generate a precise, actionable 1-2 sentence editorial prescription explaining exact title adjustments, H2 additions, or intent tweaks needed to rescue its rankings and clicks.

Return ONLY a JSON array of objects with "query" and "prescribedFix":
[
  {
    "query": "query text",
    "prescribedFix": "Specific action to take."
  }
]`;

        const llmResponse = await generateOpenRouterRawText(
          'You are an expert SEO auditor. Always output pure valid JSON.',
          prompt,
          0.2
        );

        if (llmResponse) {
          const match = llmResponse.match(/\[[\s\S]*\]/);
          if (match) {
            const fixes = JSON.parse(match[0]) as { query: string; prescribedFix: string }[];
            const fixMap = new Map(fixes.map((f) => [f.query.toLowerCase().trim(), f.prescribedFix]));

            candidateTasks.forEach((t) => {
              const fix = fixMap.get(t.query.toLowerCase().trim());
              if (fix) {
                t.prescribedFix = fix;
              }
            });
          }
        }
      } catch (llmErr) {
        console.warn('LLM Rankings Rescue batch enhancement skipped:', llmErr);
      }
    }

    return NextResponse.json({
      success: true,
      property: snapshot.property,
      totalQueries: snapshot.queries.length,
      tasks,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to analyze rankings rescue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
