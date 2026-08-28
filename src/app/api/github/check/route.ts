import { NextRequest, NextResponse } from 'next/server';
import { checkRepoConventions } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('gkd_github_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { repo, folder = 'content/posts' } = body;

    if (!repo) {
      return NextResponse.json({ error: 'Repo is required' }, { status: 400 });
    }

    const check = await checkRepoConventions(token, repo, folder);
    return NextResponse.json({ success: true, check });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to scan repository';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
