export type OpportunityTier = 'green_striking' | 'green_impressions' | 'yellow_new_content' | 'orange_cannibalization' | 'red_low_ctr';

export interface GscGapOpportunity {
  query: string;
  sourceGscQuery: string;
  tier: OpportunityTier;
  tierLabel: string;
  tierBadgeClass: string;
  tierDescription: string;
  impressions: number;
  clicks: number;
  position: number;
  ctr: number;
  page?: string;
  autocompleteScore: number;
  recommendedAction: 'Add H2 / Missing Section' | 'Add FAQ Schema' | 'Create New Article' | 'Rewrite Title / Meta' | 'Consolidate Page';
  actionPromptTemplate: string;
}

export interface PageExpansionPlan {
  pageUrl: string;
  totalImpressions: number;
  totalClicks: number;
  avgPosition: number;
  currentQueries: {
    query: string;
    impressions: number;
    clicks: number;
    position: number;
  }[];
  missingSubtopics: {
    title: string;
    targetQuery: string;
    intent: string;
    relevanceScore: number;
    suggestedHeading: string;
    type: 'section' | 'faq' | 'supporting_article';
  }[];
  titleMetaRecommendation?: {
    currentTitle: string;
    recommendedTitle: string;
    currentMeta: string;
    recommendedMeta: string;
    reason: string;
  };
}

export interface RankingsRescueTask {
  id: string;
  type: 'traffic_decay' | 'striking_distance' | 'low_ctr';
  severity: 'high' | 'medium' | 'low';
  title: string;
  url: string;
  query: string;
  impactMetrics: {
    impressions: number;
    clicks: number;
    position: number;
    ctr: number;
  };
  rootCause: string;
  prescribedFix: string;
  copyablePrompt: string;
}

export interface SearchDemandNode {
  id: string;
  name: string;
  type: 'root' | 'category' | 'query' | 'subquery';
  impressions: number;
  clicks: number;
  position: number;
  status: 'ranking_page_1' | 'striking_page_2' | 'unexplored_opportunity';
  children?: SearchDemandNode[];
}
