import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/gsc/google-auth';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const origin = req.nextUrl.origin;

  if (error || !code) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(`${origin}/?gsc_error=${encodeURIComponent(error || 'Access denied')}`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, origin);
    const response = NextResponse.redirect(`${origin}/?gsc_connected=true`);
    response.cookies.set('gkd_gsc_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 3600,
      path: '/',
    });
    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.redirect(`${origin}/?gsc_error=${encodeURIComponent(msg)}`);
  }
}
