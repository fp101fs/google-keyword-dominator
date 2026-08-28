export type SearchIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';

export interface IntentRule {
  intent: SearchIntent;
  label: string;
  shortLabel: string;
  badgeClass: string;
  description: string;
}

export const INTENT_DEFINITIONS: Record<SearchIntent, IntentRule> = {
  informational: {
    intent: 'informational',
    label: 'Informational',
    shortLabel: 'Info',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Learning, discovering, asking questions (how, what, why, tutorial, tips)',
  },
  commercial: {
    intent: 'commercial',
    label: 'Commercial',
    shortLabel: 'Comm',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Comparing, researching solutions before buying (best, review, top, vs)',
  },
  transactional: {
    intent: 'transactional',
    label: 'Transactional',
    shortLabel: 'Buy',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Ready to buy, order, download, or hire (buy, price, cheap, deals, order)',
  },
  navigational: {
    intent: 'navigational',
    label: 'Navigational',
    shortLabel: 'Nav',
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
  'buy', 'price', 'cost', 'cheap', 'discount', 'deal', 'order', 'coupon',
  'purchase', 'for sale', 'hire', 'service', 'subscription', 'software', 'download', 'shop'
];

const NAVIGATIONAL_TRIGGERS = [
  'login', 'signin', 'portal', 'website', 'official', 'app', 'near me',
  'contact', 'support', 'customer service', 'store'
];

export function detectSearchIntent(query: string, seed: string = ''): SearchIntent {
  const q = query.toLowerCase().trim();
  const s = seed.toLowerCase().trim();

  // Strip seed from query to examine modifier words
  const modifierWords = s ? q.replace(s, '').trim() : q;

  for (const trigger of TRANSACTIONAL_TRIGGERS) {
    const regex = new RegExp(`\\b${trigger}\\b`, 'i');
    if (regex.test(modifierWords) || regex.test(q)) {
      return 'transactional';
    }
  }

  for (const trigger of COMMERCIAL_TRIGGERS) {
    const regex = new RegExp(`\\b${trigger}\\b`, 'i');
    if (regex.test(modifierWords) || regex.test(q)) {
      return 'commercial';
    }
  }

  for (const trigger of INFORMATIONAL_TRIGGERS) {
    const regex = new RegExp(`\\b${trigger}\\b`, 'i');
    if (regex.test(modifierWords) || regex.test(q)) {
      return 'informational';
    }
  }

  for (const trigger of NAVIGATIONAL_TRIGGERS) {
    const regex = new RegExp(`\\b${trigger}\\b`, 'i');
    if (regex.test(modifierWords) || regex.test(q)) {
      return 'navigational';
    }
  }

  return 'informational';
}

export const classifyIntent = detectSearchIntent;
