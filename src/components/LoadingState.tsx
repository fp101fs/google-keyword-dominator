'use client';

import React from 'react';
import { Loader2, Globe, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  seed: string;
  country: string;
  language: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  seed,
  country,
  language,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 animate-pulse">
          <Globe className="w-8 h-8 animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
          <span>Retrieving Genuine Google Autocomplete Suggestions</span>
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Querying Google completion endpoints for &quot;<strong className="text-slate-700">{seed}</strong>&quot; in{' '}
          <strong className="text-slate-700 uppercase">{country}</strong> ({language}).
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
        <span>Authentic suggestions only &bull; No simulated metrics</span>
      </div>
    </div>
  );
};
