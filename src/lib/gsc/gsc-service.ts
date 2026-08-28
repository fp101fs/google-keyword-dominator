import { GscProperty, GscConnectedSnapshot, GscQueryItem, GscPageItem } from './types';

const GSC_API = 'https://www.googleapis.com/webmasters/v3';

export async function listGscProperties(accessToken: string): Promise<GscProperty[]> {
  const response = await fetch(`${GSC_API}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('GSC sites list failed:', response.status, errorText);
    throw new Error('Failed to load Search Console properties.');
  }
  const data = await response.json();
  return (data.siteEntry ?? [])
    .filter((s: { permissionLevel: string }) => s.permissionLevel !== 'siteUnverifiedUser')
    .map((s: { siteUrl: string; permissionLevel: string }) => ({
      siteUrl: s.siteUrl,
      permissionLevel: s.permissionLevel,
    }));
}

export async function getGscPropertySnapshot(accessToken: string, siteUrl: string): Promise<GscConnectedSnapshot> {
  const end = new Date(Date.now() - 2 * 86400_000);
  const start = new Date(end.getTime() - 28 * 86400_000);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const [queriesRes, pagesRes] = await Promise.all([
    fetch(`${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit: 500,
      }),
    }),
    fetch(`${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 100,
      }),
    }),
  ]);

  const queriesJson = queriesRes.ok ? await queriesRes.json() : { rows: [] };
  const pagesJson = pagesRes.ok ? await pagesRes.json() : { rows: [] };

  const queries: GscQueryItem[] = (queriesJson.rows ?? []).map((r: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => {
    const isStriking = r.position >= 10.5 && r.position <= 25 && r.impressions >= 50;
    return {
      query: r.keys[0],
      page: r.keys[1],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Number(r.ctr.toFixed(4)),
      position: Number(r.position.toFixed(1)),
      isStrikingDistance: isStriking,
    };
  });

  const pages: GscPageItem[] = (pagesJson.rows ?? []).map((r: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
    url: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Number(r.ctr.toFixed(4)),
    position: Number(r.position.toFixed(1)),
    prevClicks: 0,
    prevImpressions: 0,
  }));

  const totalClicks = pages.reduce((s, p) => s + p.clicks, 0);
  const totalImpressions = pages.reduce((s, p) => s + p.impressions, 0);

  const striking = queries.filter((q) => q.isStrikingDistance);

  return {
    property: siteUrl,
    rangeDays: 28,
    summary: {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: totalImpressions > 0 ? Number((totalClicks / totalImpressions).toFixed(4)) : 0,
      position: queries.length > 0 ? Number((queries.reduce((acc, q) => acc + q.position, 0) / queries.length).toFixed(1)) : 0,
    },
    queries,
    pages,
    strikingDistanceQueries: striking,
  };
}
