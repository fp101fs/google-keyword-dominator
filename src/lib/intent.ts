export type SearchIntent = 'informational' | 'commercial' | 'transactional' | 'navigational' | 'all';

export interface IntentRule {
  intent: Exclude<SearchIntent, 'all'>;
  label: string;
  badgeClass: string;
  description: string;
}

export const INTENT_DEFINITIONS: Record<Exclude<SearchIntent, 'all'>, IntentRule> = {
  informational: {
    intent: 'informational',
    label: 'Informational',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Learning, discovering, asking questions (how, what, why, tutorial, tips)',
  },
  commercial: {
    intent: 'commercial',
    label: 'Commercial',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Comparing, researching solutions before buying (best, review, top, vs)',
  },
  transactional: {
    intent: 'transactional',
    label: 'Transactional',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Ready to buy, order, download, or hire (buy, price, cheap, deals, order)',
  },
  navigational: {
    intent: 'navigational',
    label: 'Navigational',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Looking for a specific website, brand, or local spot (near me, login, app)',
  },
};

const INFORMATIONAL_TRIGGERS = [
  'how', 'what', 'why', 'where', 'when', 'who', 'which', 'guide', 'tutorial',
  'tips', 'ideas', 'meaning', 'example', 'definition', 'learn', 'diy', 'can', 'is', 'are'
];

const COMMERCIAL_TRIGGERS = [
  'best', 'top', 'vs', 'review', 'reviews', 'comparison', 'alternative',
  'alternatives', 'difference', 'pros and cons', 'ratings', 'recommended'
];

const TRANSACTIONAL_TRIGGERS = [
  'buy', 'price', 'pricing', 'cheap', 'cost', 'discount', 'coupon', 'deals',
  'order', 'purchase', 'sale', 'hire', 'service', 'quote', 'download', 'shop', 'for sale'
];

const NAVIGATIONAL_TRIGGERS = [
  'near me', 'login', 'sign in', 'official', 'portal', 'website', 'app',
  'contact', 'phone number', 'address', 'store hours', 'customer service'
];

export function classifyIntent(keyword: string): Exclude<SearchIntent, 'all'> {
  const lower = keyword.toLowerCase();

  // Check transactional first (strongest intent)
  if (TRANSACTIONAL_TRIGGERS.some((t) => lower.includes(t))) {
    return 'transactional';
  }

  // Check commercial
  if (COMMERCIAL_TRIGGERS.some((t) => lower.includes(t))) {
    return 'commercial';
  }

  // Check navigational
  if (NAVIGATIONAL_TRIGGERS.some((t) => lower.includes(t))) {
    return 'navigational';
  }

  // Check informational
  if (INFORMATIONAL_TRIGGERS.some((t) => lower.includes(t))) {
    return 'informational';
  }

  // Default to informational if questions / longer phrase, else commercial
  return keyword.split(/\s+/).length >= 3 ? 'informational' : 'commercial';
}
