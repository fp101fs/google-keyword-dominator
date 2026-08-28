'use client';

import React from 'react';
import { Zap, Search, Target, Grid, FileText, TrendingUp, Globe } from 'lucide-react';
import { GscConnectedSnapshot } from '@/lib/gsc/types';

export type MainNavTab = 'explorer' | 'content-gap' | 'serp-matrix' | 'content-brief' | 'gsc-striking';

interface NavbarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenContentGap: () => void;
  onOpenContentBrief: () => void;
  onOpenGscModal: () => void;
  gscSnapshot: GscConnectedSnapshot | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenContentGap,
  onOpenContentBrief,
  onOpenGscModal,
  gscSnapshot,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div
            onClick={() => onSelectTab('explorer')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Keyword Dominator <span className="text-[10px] uppercase tracking-wider bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">Ahrefs Pro</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Autocomplete &amp; Competitor Intelligence Suite
              </p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            {/* 1. Keyword Explorer */}
            <button
              onClick={() => onSelectTab('explorer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Keywords Explorer</span>
            </button>

            {/* 2. GSC Striking Distance Opportunities */}
            <button
              onClick={() => {
                onSelectTab('gsc-striking');
                onOpenGscModal();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gsc-striking'
                  ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>GSC Striking Distance</span>
              {gscSnapshot ? (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
                  {gscSnapshot.strikingDistanceQueries.length}
                </span>
              ) : (
                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                  GSC
                </span>
              )}
            </button>

            {/* 3. Ahrefs Content Gap */}
            <button
              onClick={() => {
                onSelectTab('content-gap');
                onOpenContentGap();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'content-gap'
                  ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-white/60'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-rose-600" />
              <span>Content Gap</span>
              <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-mono">Pro</span>
            </button>

            {/* 4. SERP Overlap Matrix */}
            <button
              onClick={() => onSelectTab('serp-matrix')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'serp-matrix'
                  ? 'bg-white text-amber-800 shadow-xs border border-amber-200'
                  : 'text-slate-600 hover:text-amber-600 hover:bg-white/60'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-amber-600" />
              <span>SERP Matrix</span>
            </button>

            {/* 5. Content Brief Generator */}
            <button
              onClick={() => {
                onSelectTab('content-brief');
                onOpenContentBrief();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'content-brief'
                  ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Content Briefs</span>
            </button>
          </nav>

          {/* Right Action: GSC Status Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGscModal}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                gscSnapshot
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{gscSnapshot ? gscSnapshot.property : 'Connect GSC'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
