/**
 * Global Action Sprint & Saved Items Store
 * 
 * Allows users to pin/save:
 * 1. Opportunity Graph Actions (Ranked moves with evidence)
 * 2. Generated AI Content Briefs
 * 3. Copied System Prompts / Custom Queries
 * 4. Discovered Keyword Gaps
 * 
 * Persisted in browser localStorage across pages.
 */

export type SavedItemType = 'opportunity_action' | 'content_brief' | 'prompt_snippet' | 'keyword_gap';

export interface SavedActionItem {
  id: string;
  type: SavedItemType;
  title: string;
  subtitle?: string;
  content: string; // Markdown or raw text
  metadata?: Record<string, string | number>;
  savedAt: number;
}

const STORAGE_KEY = 'gkd_saved_sprint_items_v1';

export function getSavedSprintItems(): SavedActionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSprintItem(item: Omit<SavedActionItem, 'id' | 'savedAt'>): SavedActionItem {
  const items = getSavedSprintItems();
  const newItem: SavedActionItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    savedAt: Date.now(),
  };

  // Prevent exact duplicates by content & title
  const filtered = items.filter((i) => !(i.title === item.title && i.type === item.type));
  const updated = [newItem, ...filtered];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gkd_sprint_updated'));
  } catch {
    // Storage full or disabled
  }

  return newItem;
}

export function removeSprintItem(id: string): void {
  const items = getSavedSprintItems().filter((i) => i.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('gkd_sprint_updated'));
  } catch {
    // Storage error
  }
}

export function clearAllSprintItems(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('gkd_sprint_updated'));
  } catch {
    // Storage error
  }
}
