'use client';

import React, { useState } from 'react';
import { KeywordSummaryMetrics } from '@/lib/autocomplete';
import { HelpCircle, KeyRound, Flame, BarChart3, ListOrdered, Award, Zap } from 'lucide-react';

interface SummaryContainersProps {
  metrics: KeywordSummaryMetrics;
}

export const SummaryContainers: React.FC<SummaryContainersProps> = ({ metrics }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleTooltip = (name: string) => {
    setActiveTooltip(activeTooltip === name ? null : name);
  };

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 select-none">
      {/* 1. Keywords Count */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between relative hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <KeyRound className="w-4 h-4 text-blue-600" />
          <button
            type="button"
            onClick={() => toggleTooltip('keywords')}
            className="hover:text-slate-600 focus:outline-none"
            title="Total number of real keywords found"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.totalKeywords}
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Keywords
          </div>
        </div>
        {activeTooltip === 'keywords' && (
          <div className="absolute z-20 bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
            Total number of unique, genuine Google autocomplete keywords discovered for the seed.
          </div>
        )}
      </div>

      {/* 2. Hot Keywords */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between relative hover:border-amber-300 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <Flame className="w-4 h-4 text-amber-500" />
          <button
            type="button"
            onClick={() => toggleTooltip('hot')}
            className="hover:text-slate-600 focus:outline-none"
            title="Hot and trending keyword count"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {metrics.hotKeywordsCount}
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Hot
          </div>
        </div>
        {activeTooltip === 'hot' && (
          <div className="absolute z-20 bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
            Most popular, relevant, and top-ranking terms with lower AP and higher relative scores.
          </div>
        )}
      </div>

      {/* 3. Avg Score */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between relative hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <button
            type="button"
            onClick={() => toggleTooltip('score')}
            className="hover:text-slate-600 focus:outline-none"
            title="Average relative score"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-indigo-600 tracking-tight">
            {metrics.avgScore}
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Avg Score
          </div>
        </div>
        {activeTooltip === 'score' && (
          <div className="absolute z-20 bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
            Average relative popularity score calculated across this specific set of keywords.
          </div>
        )}
      </div>

      {/* 4. Avg AP */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between relative hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <ListOrdered className="w-4 h-4 text-blue-500" />
          <button
            type="button"
            onClick={() => toggleTooltip('ap')}
            className="hover:text-slate-600 focus:outline-none"
            title="Average autocomplete placement"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.avgAp}
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Avg AP
          </div>
        </div>
        {activeTooltip === 'ap' && (
          <div className="absolute z-20 bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
            Average Autocomplete Placement rank (rank position in Google completion dropdown).
          </div>
        )}
      </div>

      {/* 5. AP <= 3 */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between relative hover:border-emerald-300 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <Award className="w-4 h-4 text-emerald-600" />
          <button
            type="button"
            onClick={() => toggleTooltip('ap3')}
            className="hover:text-slate-600 focus:outline-none"
            title="Keywords ranked in top 3 positions"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {metrics.apLte3Count}
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            AP &le; 3
          </div>
        </div>
        {activeTooltip === 'ap3' && (
          <div className="absolute z-20 bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
            Number of keywords holding top 3 Autocomplete Placement (1st, 2nd, or 3rd position).
          </div>
        )}
      </div>

      {/* 6. Difficulty Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between relative hover:border-purple-300 transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <Zap className="w-4 h-4 text-purple-600" />
          <button
            type="button"
            onClick={() => toggleTooltip('diff')}
            className="hover:text-slate-600 focus:outline-none"
            title="Difficulty distribution"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-1 space-y-0.5">
          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span className="text-emerald-700 font-extrabold">{metrics.difficultyBreakdown.low}</span> Low
          </div>
          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span className="text-amber-700 font-extrabold">{metrics.difficultyBreakdown.med}</span> Med
          </div>
          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span className="text-rose-700 font-extrabold">{metrics.difficultyBreakdown.high}</span> High
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-0.5 border-t border-slate-100">
            Difficulty
          </div>
        </div>
        {activeTooltip === 'diff' && (
          <div className="absolute z-20 bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
            Competition level for keyword rank positions (Low, Medium, or High) based on AP value, score, and word count.
          </div>
        )}
      </div>

      {/* 7. Seeds */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between relative hover:border-slate-400 transition-all col-span-2 sm:col-span-4 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400">
          <KeyRound className="w-4 h-4 text-slate-600" />
          <button
            type="button"
            onClick={() => toggleTooltip('seeds')}
            className="hover:text-slate-600 focus:outline-none"
            title="Number of seed keywords searched"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.seedCount}
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Seeds
          </div>
        </div>
        {activeTooltip === 'seeds' && (
          <div className="absolute z-20 bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
            The initial search phrase used as starting point to generate keyword suggestions.
          </div>
        )}
      </div>
    </div>
  );
};
