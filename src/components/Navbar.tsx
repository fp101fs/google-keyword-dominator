'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Search,
  Target,
  Sparkles,
  BookOpen,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { GscConnectedSnapshot } from '@/lib/gsc/types';

export type MainNavTab = 'explorer' | 'content-gap' | 'serp-matrix' | 'content-brief' | 'gsc-striking' | 'intelligence';

interface NavbarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenContentGap: () => void;
  onOpenContentBrief: () => void;
  onOpenGscModal: () => void;
  onOpenIntelligenceModal: () => void;
  gscSnapshot: GscConnectedSnapshot | null;
  selectedProperty?: string;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenContentGap,
  onOpenIntelligenceModal,
  gscSnapshot,
  selectedProperty,
  isAuthenticated = false,
}) => {
  const currentDomain = (selectedProperty || gscSnapshot?.property || '').replace(/^(sc-domain:|https?:\/\/)/, '').replace(/\/$/, '') || 'trailgearhub.com';

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <div
            onClick={() => onSelectTab('explorer')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                Keyword Dominator
              </span>
            </div>
          </div>

          {/* 3 Unified Operational Hubs (#1) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {/* Hub 1: Explorer */}
            <button
              onClick={() => onSelectTab('explorer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'explorer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Explorer</span>
            </button>

            {/* Hub 2: Next 100 Wins (Search Opportunity Graph) */}
            <button
              onClick={() => {
                onSelectTab('intelligence');
                onOpenIntelligenceModal();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'intelligence'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Next 100 Wins</span>
              <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                AI
              </span>
            </button>

            {/* Hub 3: Competitive SERP (Content Gap & Matrix) */}
            <button
              onClick={() => {
                onSelectTab('content-gap');
                onOpenContentGap();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'content-gap'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-white/50'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-rose-600" />
              <span>3. Competitor Gap</span>
            </button>

            {/* Guide Link */}
            <Link
              href="/guide"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Guide</span>
            </Link>
          </nav>

          {/* Right Action: Active Domain Status Pill (#5) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenIntelligenceModal}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                isAuthenticated
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Click to manage connected Google Search Console properties & opportunity graph"
            >
              <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {currentDomain}
              </span>
              {!isAuthenticated && (
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(Demo)</span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
