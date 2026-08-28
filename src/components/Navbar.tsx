'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Search, Target, Grid, FileText, Globe, Sparkles, BookOpen } from 'lucide-react';
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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenContentGap,
  onOpenContentBrief,
  onOpenGscModal,
  onOpenIntelligenceModal,
  gscSnapshot,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Clean Minimalist Logo */}
          <div
            onClick={() => onSelectTab('explorer')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Keyword Dominator
              </span>
            </div>
          </div>

          {/* Decluttered Sleek Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('explorer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Explorer</span>
              </span>
            </button>

            <button
              onClick={() => {
                onSelectTab('intelligence');
                onOpenIntelligenceModal();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'intelligence'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Search Intelligence</span>
              </span>
            </button>

            <button
              onClick={() => {
                onSelectTab('content-gap');
                onOpenContentGap();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'content-gap'
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-600" />
                <span>Content Gap</span>
              </span>
            </button>

            <button
              onClick={() => onSelectTab('serp-matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'serp-matrix'
                  ? 'bg-amber-50 text-amber-800'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-amber-600" />
                <span>SERP Matrix</span>
              </span>
            </button>

            <button
              onClick={() => {
                onSelectTab('content-brief');
                onOpenContentBrief();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'content-brief'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Briefs</span>
              </span>
            </button>

            <Link
              href="/guide"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Guide</span>
            </Link>
          </nav>

          {/* Right Action: Clean GSC Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGscModal}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                gscSnapshot
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-xs'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${gscSnapshot ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>{gscSnapshot ? gscSnapshot.property : 'Connect GSC'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
