import { GscConnectedSnapshot, GscQueryItem } from './types';

const D = 'https://trailgearhub.com';

export function getGscDemoSnapshot(): GscConnectedSnapshot {
  const pages = [
    { url: `${D}/best-hiking-boots-2026`, clicks: 1840, impressions: 52400, ctr: 0.0351, position: 6.2, prevClicks: 2710, prevImpressions: 58900 },
    { url: `${D}/ultralight-backpacking-gear-list`, clicks: 1320, impressions: 31200, ctr: 0.0423, position: 4.8, prevClicks: 1295, prevImpressions: 30100 },
    { url: `${D}/best-trekking-poles`, clicks: 980, impressions: 44800, ctr: 0.0219, position: 8.4, prevClicks: 1010, prevImpressions: 42100 },
    { url: `${D}/how-to-break-in-hiking-boots`, clicks: 760, impressions: 12900, ctr: 0.0589, position: 3.1, prevClicks: 1180, prevImpressions: 16800 },
    { url: `${D}/best-rain-jackets-hiking`, clicks: 645, impressions: 38600, ctr: 0.0167, position: 9.7, prevClicks: 612, prevImpressions: 35200 },
    { url: `${D}/day-hike-packing-checklist`, clicks: 470, impressions: 21700, ctr: 0.0217, position: 11.3, prevClicks: 689, prevImpressions: 27400 },
    { url: `${D}/best-budget-tents-under-200`, clicks: 410, impressions: 18900, ctr: 0.0217, position: 12.6, prevClicks: 398, prevImpressions: 17800 },
    { url: `${D}/water-filters-backpacking`, clicks: 290, impressions: 16200, ctr: 0.0179, position: 13.8, prevClicks: 460, prevImpressions: 19500 },
    { url: `${D}/trail-running-shoes-vs-hiking-shoes`, clicks: 185, impressions: 11400, ctr: 0.0162, position: 14.9, prevClicks: 198, prevImpressions: 15300 },
    { url: `${D}/headlamps-for-hiking`, clicks: 60, impressions: 5900, ctr: 0.0102, position: 18.2, prevClicks: 58, prevImpressions: 5400 },
  ];

  const queries: GscQueryItem[] = [
    { query: "best hiking boots 2026", clicks: 920, impressions: 24100, ctr: 0.0382, position: 5.8, page: `${D}/best-hiking-boots-2026` },
    { query: "ultralight backpacking gear list", clicks: 610, impressions: 11900, ctr: 0.0513, position: 4.2, page: `${D}/ultralight-backpacking-gear-list` },
    { query: "best trekking poles", clicks: 480, impressions: 19800, ctr: 0.0242, position: 7.9, page: `${D}/best-trekking-poles` },
    { query: "how to break in hiking boots fast", clicks: 410, impressions: 6200, ctr: 0.0661, position: 2.8, page: `${D}/how-to-break-in-hiking-boots` },
    { query: "best rain jacket for hiking", clicks: 340, impressions: 17400, ctr: 0.0195, position: 8.6, page: `${D}/best-rain-jackets-hiking` },
    // Striking Distance Page-2 Opportunities (Positions 11 to 25)
    { query: "lightweight rain jacket backpacking", clicks: 88, impressions: 7900, ctr: 0.0111, position: 11.2, page: `${D}/best-rain-jackets-hiking`, isStrikingDistance: true },
    { query: "day hike packing list", clicks: 240, impressions: 10800, ctr: 0.0222, position: 11.4, page: `${D}/day-hike-packing-checklist`, isStrikingDistance: true },
    { query: "best budget backpacking tent", clicks: 210, impressions: 9600, ctr: 0.0219, position: 11.4, page: `${D}/best-budget-tents-under-200`, isStrikingDistance: true },
    { query: "tents under 200", clicks: 95, impressions: 4900, ctr: 0.0194, position: 13.1, page: `${D}/best-budget-tents-under-200`, isStrikingDistance: true },
    { query: "best water filter backpacking", clicks: 150, impressions: 8700, ctr: 0.0172, position: 12.9, page: `${D}/water-filters-backpacking`, isStrikingDistance: true },
    { query: "trail runners vs hiking boots", clicks: 98, impressions: 6100, ctr: 0.0161, position: 13.7, page: `${D}/trail-running-shoes-vs-hiking-shoes`, isStrikingDistance: true },
    { query: "best headlamp for hiking", clicks: 32, impressions: 3400, ctr: 0.0094, position: 17.6, page: `${D}/headlamps-for-hiking`, isStrikingDistance: true },
  ];

  const striking = queries.filter((q) => q.isStrikingDistance || (q.position >= 10.5 && q.position <= 25));

  const totalClicks = pages.reduce((s, p) => s + p.clicks, 0);
  const totalImpressions = pages.reduce((s, p) => s + p.impressions, 0);

  return {
    property: 'trailgearhub.com',
    rangeDays: 28,
    summary: {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: Number((totalClicks / totalImpressions).toFixed(4)),
      position: 8.9,
    },
    pages,
    queries,
    strikingDistanceQueries: striking,
    demo: true,
  };
}
