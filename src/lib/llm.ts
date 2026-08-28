/**
 * Shared OpenRouter LLM Helper for Google Keyword Dominator
 */

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

export async function generateLlmContentBrief(
  seed: string,
  rawKeywords: string[]
): Promise<LlmBriefResponse | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('OPENROUTER_API_KEY not configured, falling back to structured keywords.');
    return null;
  }

  const prompt = `You are a world-class senior SEO content strategist.
Given the target seed keyword and a list of real Google autocomplete search queries, generate an authoritative, highly comprehensive content brief.

Target Seed Keyword: "${seed}"
Discovered Autocomplete Queries:
${rawKeywords.slice(0, 30).map((k) => `- ${k}`).join('\n')}

Instructions:
1. Write a compelling, click-worthy H1 title targeting the core intent (no cheesy buzzwords, clear and authoritative).
2. Group the discovered keywords into 5-7 logical, sequential H2 subheadings that thoroughly cover the topic without fluff.
3. Select 4-6 genuine user questions that people ask about this topic. For each question, provide a concise, direct 2-sentence answer snippet optimized for Google Featured Snippets and FAQ Schema.
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
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO architect. Always output pure JSON without markdown backticks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('OpenRouter API call failed:', res.status, errText);
      return null;
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim();
    if (!rawContent) return null;

    const cleanJson = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleanJson) as LlmBriefResponse;
  } catch (err) {
    console.error('Error generating LLM content brief:', err);
    return null;
  }
}
