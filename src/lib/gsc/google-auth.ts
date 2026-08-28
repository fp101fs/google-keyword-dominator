import { cookies } from 'next/headers';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export function getRedirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(origin: string, state: string = 'gkd_state'): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is missing');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(origin),
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

export async function exchangeCodeForTokens(code: string, origin: string): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials missing in environment variables');
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(origin),
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Google token exchange failed:', errorText);
    throw new Error('Failed to exchange Google OAuth code');
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
  };
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials missing in environment variables');
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Google token refresh failed:', errorText);
    throw new Error('Failed to refresh Google token');
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: refreshToken,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
  };
}

export async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('gkd_gsc_tokens')?.value;
  if (!tokenCookie) return null;

  try {
    const tokens: GoogleTokens = JSON.parse(tokenCookie);
    if (Date.now() < tokens.expires_at - 60000) {
      return tokens.access_token;
    }
    if (tokens.refresh_token) {
      const refreshed = await refreshGoogleAccessToken(tokens.refresh_token);
      cookieStore.set('gkd_gsc_tokens', JSON.stringify(refreshed), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 3600,
        path: '/',
      });
      return refreshed.access_token;
    }
    return tokens.access_token;
  } catch {
    return null;
  }
}
