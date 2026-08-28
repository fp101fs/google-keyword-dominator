export type PlatformType = 'google' | 'youtube' | 'amazon' | 'bing';

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  badge: string;
  iconName: string;
  accentColor: string;
  placeholder: string;
  description: string;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'google',
    name: 'Google',
    badge: 'Search',
    iconName: 'Search',
    accentColor: 'blue',
    placeholder: 'e.g. coffee maker, best * for podcasting...',
    description: 'Real-time Google search suggestions and web trends.',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    badge: 'Video',
    iconName: 'Video',
    accentColor: 'rose',
    placeholder: 'e.g. workout music, python tutorial, unboxing...',
    description: 'YouTube search video intent and popular tags.',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    badge: 'E-Commerce',
    iconName: 'ShoppingBag',
    accentColor: 'amber',
    placeholder: 'e.g. wireless earbuds, desk lamp, organic...',
    description: 'High-converting buyer queries and product searches.',
  },
  {
    id: 'bing',
    name: 'Bing',
    badge: 'Search / Copilot',
    iconName: 'Globe',
    accentColor: 'emerald',
    placeholder: 'e.g. flights to tokyo, ai tools, real estate...',
    description: 'Bing and Copilot search intent keywords.',
  },
];

export function getPlatformById(id: string): PlatformConfig {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[0];
}
