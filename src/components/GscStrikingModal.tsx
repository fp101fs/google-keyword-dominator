'use client';

import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, Globe, ArrowRight, ShieldCheck, Loader2, LogOut, CheckCircle, RefreshCw } from 'lucide-react';
import { GscConnectedSnapshot, GscProperty, GscQueryItem } from '@/lib/gsc/types';

interface GscStrikingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQueryForExpansion: (query: string) => void;
  connectedSnapshot: GscConnectedSnapshot | null;
  onConnectDemo: () => Promise<void>;
  isLoadingGsc: boolean;
  properties: GscProperty[];
  selectedProperty: string;
  onSelectProperty: (propertyUrl: string) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const GscStrikingModal: React.FC<GscStrikingModalProps> = ({
  isOpen,
  onClose,
  onSelectQueryForExpansion,
  connectedSnapshot,
  onConnectDemo,
  isLoadingGsc,
  properties,
  selectedProperty,
  onSelectProperty,
  isAuthenticated,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'striking' | 'all'>('striking');

  if (!isOpen) return null;

  const queries = connectedSnapshot?.strikingDistanceQueries || [];
  const allQueries = connectedSnapshot?.queries || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                Google Search Console &bull; Striking Distance
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Page 2 &rarr; Page 1
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Live Google Search Console performance queries ranking in positions 11&ndash;25.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Quick Actions Bar (Always Visible: Connect Google, Demo, & Disconnect) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Property:</span>
              {properties.length > 1 ? (
                <select
                  value={selectedProperty}
                  onChange={(e) => onSelectProperty(e.target.value)}
                  className="p-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 cursor-pointer focus:outline-hidden"
                >
                  {properties.map((p) => (
                    <option key={p.siteUrl} value={p.siteUrl}>
                      {p.siteUrl}
                    </option>
                  ))}
                </select>
              ) : (
                <strong className="text-slate-900 font-bold">
                  {connectedSnapshot?.property || selectedProperty || (isAuthenticated ? 'Connected' : 'Not Connected')}
                </strong>
              )}

              {connectedSnapshot?.demo && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  Demo Data
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* If Not Connected or in Demo Mode, show Connect Google Account button */}
              {(!isAuthenticated || connectedSnapshot?.demo) && (
                <a
                  href="/api/auth/google"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Connect Google Account</span>
                </a>
              )}

              {/* Demo Mode Button if not loaded */}
              {!connectedSnapshot && (
                <button
                  onClick={onConnectDemo}
                  disabled={isLoadingGsc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoadingGsc ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Demo Mode</span>
                </button>
              )}

              {/* Disconnect Button if authenticated or demo active */}
              {(isAuthenticated || connectedSnapshot) && (
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer text-xs font-bold"
                  title="Disconnect Google Search Console"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </div>

          {!connectedSnapshot ? (
            /* Disconnected Welcome Card */
            <div className="text-center py-8 px-4 space-y-6 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Globe className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900">
                  Connect Your Google Search Console
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sign in with Google to load your verified websites, real search impressions, CTR, average rankings, and Page-2 striking distance opportunities.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href="/api/auth/google"
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Connect Google Account</span>
                </a>

                <button
                  onClick={onConnectDemo}
                  disabled={isLoadingGsc}
                  className="w-full sm:w-auto px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoadingGsc ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>Explore with Demo Data</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Read-only access &bull; Credentials never stored permanently</span>
              </div>
            </div>
          ) : (
            /* Connected Queries List */
            <div className="space-y-4">
              {/* Sub-Tabs: Striking vs All Queries */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('striking')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'striking'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Striking Distance Opportunities ({queries.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>All Ranking Queries ({allQueries.length})</span>
                  </button>
                </div>

                {isLoadingGsc && (
                  <div className="flex items-center gap-1 text-slate-400 font-normal">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Loading...</span>
                  </div>
                )}
              </div>

              {/* Queries List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto">
                {(activeTab === 'striking' ? queries : allQueries).map((item: GscQueryItem, idx: number) => (
                  <div
                    key={`${item.query}-${idx}`}
                    className="p-4 bg-white hover:bg-emerald-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{item.query}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          item.position <= 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Pos #{item.position}
                        </span>
                        {item.isStrikingDistance && (
                          <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded">
                            Striking Target
                          </span>
                        )}
                      </div>
                      {item.page && (
                        <p className="text-[11px] text-slate-400 truncate max-w-md">
                          URL: {item.page}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-800">
                          {item.impressions.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                          Impressions
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectQueryForExpansion(item.query);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Discover Autocomplete Expansions for this Query"
                      >
                        <span>Expand in GKD</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Search Console API &bull; Read-Only</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
