export interface GscProperty {
  siteUrl: string;
  permissionLevel: string;
}

export interface GscQueryItem {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  page?: string;
  isStrikingDistance?: boolean; // Position 11 to 25 with impressions >= 100
}

export interface GscPageItem {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks: number;
  prevImpressions: number;
}

export interface GscConnectedSnapshot {
  property: string;
  rangeDays: number;
  summary: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  queries: GscQueryItem[];
  pages: GscPageItem[];
  strikingDistanceQueries: GscQueryItem[];
  demo?: boolean;
}
