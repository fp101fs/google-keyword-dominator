/**
 * Shared OpenRouter LLM Client for Google Keyword Dominator
 * Model: deepseek/deepseek-v4-flash-0731
 */

const OPENROUTER_MODEL = 'deepseek/deepseek-v4-flash-0731';

export interface LlmBriefResponse {
  suggestedH1: string;
  recommendedH2s: string[];
  recommendedFaqs: {
    question: string;
    answerSnippet: string;
  }[];
  contentAngle: string;
  targetAudience: string;
}

export interface LlmTitleMetaResponse {
  recommendedTitle: string;
  recommendedMeta: string;
  reason: string;
}

export interface LlmRescueResponse {
  prescribedFix: string;
  actionableNotes: string;
}

export interface LlmGapActionResponse {
  actionDescription: string;
}

export interface LlmPageAuditResponse {
  score: number;
  criticalIssues: string[];
  recommendedImprovements: string[];
  missingSubtopics: string[];
  intentAlignment: string;
}

export interface LlmCompetitorGapResponse {
  topCompetitorAngles: string[];
  highOpportunitySubtopics: string[];
  differentiationStrategy: string;
}

export async function generateOpenRouterRawText(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.3
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return '';

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://google-keyword-dominator.vercel.app',
        'X-Title': 'Google Keyword Dominator',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
      }),
    });

    if (!res.ok) return '';
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch {
    return '';
  }
}

async function callOpenRouterWithSearch(prompt: string, systemPrompt: string = 'You are an expert SEO strategist. Always output pure valid JSON without markdown wrapping.'): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('OPENROUTER_API_KEY is not configured');
    return null;
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://google-keyword-dominator.vercel.app',
        'X-Title': 'Google Keyword Dominator',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        tools: [
          {
            type: 'openrouter:web_search',
            parameters: {
              engine: 'auto',
              max_results: 5,
            },
          },
        ],
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('OpenRouter error:', res.status, err);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  } catch (err) {
    console.error('OpenRouter fetch exception:', err);
    return null;
  }
}

async function callOpenRouterWithWebFetch(url: string, prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://google-keyword-dominator.vercel.app',
        'X-Title': 'Google Keyword Dominator',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        tools: [
          {
            type: 'openrouter:web_fetch',
            parameters: {
              engine: 'auto',
              max_uses: 2,
            },
          },
        ],
        messages: [
          {
            role: 'system',
            content: 'You are an elite SEO auditor. Use web_fetch to read the URL and analyze its on-page optimization. Output pure valid JSON.',
          },
          {
            role: 'user',
            content: `Use web_fetch to read "${url}".\n${prompt}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  } catch (err) {
    console.error('Error in web_fetch LLM call:', err);
    return null;
  }
}

/**
 * 1. Content Brief Generator with Real-Time Web Search and Optional Site Context
 */
export async function generateLlmContentBrief(
  seed: string,
  rawKeywords: string[],
  siteContext?: { siteName?: string; businessType?: string; targetAudience?: string; situationalSummary?: string }
): Promise<LlmBriefResponse | null> {
  const contextSnippet = siteContext?.situationalSummary
    ? `\nClient Website Context:
- Brand/Site Name: ${siteContext.siteName || 'Not specified'}
- Business Type: ${siteContext.businessType || 'Website'}
- Target Audience: ${siteContext.targetAudience || 'General Audience'}
- Situational Knowledge: ${siteContext.situationalSummary}\nEnsure this brief directly reflects this business's specific situation and tone.`
    : '';

  const prompt = `Use web_search to search Google for "${seed}" to discover the current People Also Ask (PAA) questions, search trends, and top ranking content structure.

Target Seed Keyword: "${seed}"${contextSnippet}
Discovered Autocomplete Queries:
${rawKeywords.slice(0, 30).map((k) => `- ${k}`).join('\n')}

Instructions:
1. Write a compelling, click-worthy H1 title targeting the core intent (tailored to the business if context was provided).
2. Group the discovered keywords into 5-7 logical, sequential H2 subheadings that thoroughly cover the topic without fluff.
3. Extract 4-6 genuine People Also Ask (PAA) user questions from Google search results. For each question, provide a concise, direct 2-sentence answer snippet optimized for Google Featured Snippets and FAQ Schema.
4. Describe the target audience and primary content angle.

Return ONLY valid JSON matching this exact structure:
{
  "suggestedH1": "string",
  "recommendedH2s": ["H2 title 1", "H2 title 2", "H2 title 3", "H2 title 4", "H2 title 5"],
  "recommendedFaqs": [
    {
      "question": "Question text ending with ?",
      "answerSnippet": "Concise 2-sentence direct answer."
    }
  ],
  "contentAngle": "string",
  "targetAudience": "string"
}`;

  const jsonStr = await callOpenRouterWithSearch(prompt);
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as LlmBriefResponse;
  } catch (err) {
    console.error('Failed to parse LLM Brief JSON:', err, jsonStr);
    return null;
  }
}

/**
 * 2. Page Grader: Live URL Fetch & Intelligent SEO Audit via web_fetch
 */
export async function auditPageWithLlmWebFetch(
  url: string,
  targetKeyword: string
): Promise<LlmPageAuditResponse | null> {
  const prompt = `Perform an in-depth SEO audit of this page for the primary keyword "${targetKeyword}".
Evaluate:
1. Target keyword intent alignment.
2. Missing subtopics or unanswered user questions.
3. Content depth and structure compared to top ranking SERP competitors.

Return ONLY valid JSON:
{
  "score": 85,
  "criticalIssues": ["Issue 1", "Issue 2"],
  "recommendedImprovements": ["Improvement 1", "Improvement 2", "Improvement 3"],
  "missingSubtopics": ["Missing subtopic 1", "Missing subtopic 2"],
  "intentAlignment": "Short summary of search intent match"
}`;

  const jsonStr = await callOpenRouterWithWebFetch(url, prompt);
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as LlmPageAuditResponse;
  } catch {
    return null;
  }
}

/**
 * 3. Competitor Content Gap Synthesis via web_search
 */
export async function synthesizeCompetitorGapWithLlm(
  targetSeed: string,
  competitorSeeds: string[],
  discoveredGaps: string[]
): Promise<LlmCompetitorGapResponse | null> {
  const prompt = `Use web_search to analyze current competitor search results for target topic "${targetSeed}" vs competitors: ${competitorSeeds.join(', ')}.
Discovered keyword gaps:
${discoveredGaps.slice(0, 20).map((k) => `- ${k}`).join('\n')}

Synthesize the competitor positioning and prescribe the optimal differentiation angle.

Return ONLY valid JSON:
{
  "topCompetitorAngles": ["Angle 1", "Angle 2"],
  "highOpportunitySubtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
  "differentiationStrategy": "1-2 sentence actionable strategy to outrank these competitors"
}`;

  const jsonStr = await callOpenRouterWithSearch(prompt);
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as LlmCompetitorGapResponse;
  } catch {
    return null;
  }
}

/**
 * 4. Page Expansion Title & Meta Description Generator via LLM
 */
export async function generateLlmPageTitleMeta(
  pageUrl: string,
  topQueries: { query: string; impressions: number; clicks: number; position: number }[]
): Promise<LlmTitleMetaResponse | null> {
  const prompt = `An existing webpage on "${pageUrl}" is receiving Google Search impressions for the following search queries:
${topQueries.slice(0, 10).map((q) => `- "${q.query}" (${q.impressions} imp, ${q.clicks} clicks, Avg Pos #${q.position})`).join('\n')}

Generate an optimized HTML <title> tag (max 60 chars) and <meta name="description"> (max 155 chars) that will maximize organic CTR and align directly with the dominant search intent of these queries.

Return ONLY valid JSON:
{
  "recommendedTitle": "Optimized Title Tag",
  "recommendedMeta": "Compelling Meta Description with clear value proposition and call to action.",
  "reason": "1-sentence strategic rationale explaining why this snippet will drive more clicks."
}`;

  const jsonStr = await callOpenRouterWithSearch(prompt);
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as LlmTitleMetaResponse;
  } catch {
    return null;
  }
}

/**
 * 5. Rankings Rescue Protocol Prescriptions via LLM
 */
export async function generateLlmRankingsRescue(
  query: string,
  pageUrl: string,
  impressions: number,
  position: number,
  ctr: number,
  type: 'low_ctr' | 'striking_distance'
): Promise<LlmRescueResponse | null> {
  const prompt = `A webpage ("${pageUrl}") is targeting the query "${query}" on Google Search:
- Current Position: #${position}
- Impressions: ${impressions.toLocaleString()}
- CTR: ${(ctr * 100).toFixed(1)}%
- Issue Type: ${type === 'low_ctr' ? 'High impressions in top 10 but losing clicks due to poor CTR' : 'Stuck on Page 2 (Positions 11-20) in striking distance'}

Prescribe an exact, authoritative editorial fix to solve this issue and gain traffic.

Return ONLY valid JSON:
{
  "prescribedFix": "Specific action to take (e.g. Add 200-word section covering [X], rewrite H1/title with [Y]).",
  "actionableNotes": "Key elements to include."
}`;

  const jsonStr = await callOpenRouterWithSearch(prompt);
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as LlmRescueResponse;
  } catch {
    return null;
  }
}

/**
 * 6. Strategic GSC Gap Action Plan via LLM
 */
export async function generateLlmGapAction(
  query: string,
  tier: string,
  gscData?: { position: number; impressions: number }
): Promise<LlmGapActionResponse | null> {
  const prompt = `Evaluate this keyword opportunity for SEO:
- Query: "${query}"
- Opportunity Tier: "${tier}"
${gscData ? `- Existing GSC Position: #${gscData.position}, Impressions: ${gscData.impressions}` : '- Currently 0 GSC impressions (Brand new topic demand)'}

Write a 1-sentence strategic execution recommendation for an SEO content creator.

Return ONLY valid JSON:
{
  "actionDescription": "Strategic recommendation"
}`;

  const jsonStr = await callOpenRouterWithSearch(prompt);
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as LlmGapActionResponse;
  } catch {
    return null;
  }
}
