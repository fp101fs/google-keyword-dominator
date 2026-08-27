'use client';

import React from 'react';
import { Search, Sparkles, HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  hasSearched?: boolean;
  seed?: string;
  onSuggestionClick?: (keyword: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasSearched = false,
  seed = '',
  onSuggestionClick,
}) => {
  if (hasSearched) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
          <HelpCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">
            No Autocomplete Suggestions Found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Google&apos;s autocomplete returned zero suggestions for &quot;<strong className="text-slate-700">{seed}</strong>&quot;.
            Try a broader keyword, check your spelling, or enable Alphabet (A-Z) expansion.
          </p>
        </div>
      </div>
    );
  }

  const starterKeywords = [
    'best headphones for',
    'seo tools * beginners',
    'how to learn python',
    'crm software * sales',
    'healthy breakfast ideas',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-6">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
        <Search className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-slate-900">
          Discover Real Google Search Queries &amp; Long-Tail Keywords
        </h3>
        <p className="text-sm text-slate-500">
          Type a seed keyword above to pull authentic autocomplete suggestions directly from Google. Filter, sort, and export to CSV in seconds.
        </p>
      </div>

      {onSuggestionClick && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Try searching these ideas</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {starterKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => onSuggestionClick(kw)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
