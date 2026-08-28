'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Search,
  Target,
  Sparkles,
  BookOpen,
  Globe,
  ChevronDown,
  Check,
  LogOut,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { GscConnectedSnapshot, GscProperty } from '@/lib/gsc/types';

export type MainNavTab = 'explorer' | 'content-gap' | 'serp-matrix' | 'content-brief' | 'gsc-striking' | 'intelligence';

interface NavbarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenContentGap: () => void;
  onOpenContentBrief: () => void;
  onOpenGscModal: () => void;
  onOpenIntelligenceModal: () => void;
  gscSnapshot: GscConnectedSnapshot | null;
  properties?: GscProperty[];
  selectedProperty?: string;
  onSelectProperty?: (url: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenContentGap,
  onOpenIntelligenceModal,
  gscSnapshot,
  properties = [],
  selectedProperty = '',
  onSelectProperty,
  isAuthenticated = false,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentDomain = (selectedProperty || gscSnapshot?.property || '').replace(/^(sc-domain:|https?:\/\/)/, '').replace(/\/$/, '') || 'trailgearhub.com';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

          {/* Right Action: GSC Property Switcher & Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                isAuthenticated
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Click to select Google Search Console property"
            >
              <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {currentDomain}
              </span>
              {!isAuthenticated && (
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(Demo)</span>
              )}
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Property Selector Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {isAuthenticated ? 'Connected GSC Properties' : 'Google Search Console Demo'}
                  </span>
                  <div className="font-extrabold text-xs text-slate-800 truncate mt-0.5">
                    {currentDomain}
                  </div>
                </div>

                {/* Property List */}
                <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                  {properties.length > 0 ? (
                    properties.map((p) => {
                      const isSelected = selectedProperty === p.siteUrl;
                      const cleanName = p.siteUrl.replace(/^(sc-domain:|https?:\/\/)/, '').replace(/\/$/, '');

                      return (
                        <button
                          key={p.siteUrl}
                          onClick={() => {
                            if (onSelectProperty) onSelectProperty(p.siteUrl);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-blue-50/60 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{cleanName}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3.5 py-2 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">trailgearhub.com</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">Demo</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-2 border-t border-slate-100 bg-slate-50/50 space-y-1">
                  {!isAuthenticated ? (
                    <a
                      href="/api/auth/google"
                      className="w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Connect Live GSC Account</span>
                    </a>
                  ) : (
                    <>
                      <a
                        href="/api/auth/google"
                        className="w-full px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg flex items-center justify-between font-semibold transition-colors"
                      >
                        <span>Re-authenticate Account</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      {onLogout && (
                        <button
                          onClick={() => {
                            onLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-between font-semibold transition-colors cursor-pointer"
                        >
                          <span>Disconnect Search Console</span>
                          <LogOut className="w-3 h-3 text-rose-500" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
