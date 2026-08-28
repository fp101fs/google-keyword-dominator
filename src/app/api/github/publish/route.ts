import { NextRequest, NextResponse } from 'next/server';
import { publishFileToGithub } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('gkd_github_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { repo, path, content, message } = body;

    if (!repo || !path || !content) {
      return NextResponse.json({ error: 'Missing required parameters (repo, path, content)' }, { status: 400 });
    }

    const result = await publishFileToGithub(token, {
      repo,
      path,
      content,
      message: message || `feat(blog): publish ${path.split('/').pop() || 'article'}`,
    });

    return NextResponse.json({
      success: true,
      fileUrl: result.fileUrl,
      commitUrl: result.commitUrl,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to publish to GitHub';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
