import { NextRequest, NextResponse } from 'next/server';
import { listUserRepos } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gkd_github_token')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, repos: [] });
  }

  try {
    const repos = await listUserRepos(token);
    return NextResponse.json({ authenticated: true, repos });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list repos';
    return NextResponse.json({ error: msg, authenticated: false }, { status: 401 });
  }
}
