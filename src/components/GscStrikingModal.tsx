'use client';

import React from 'react';
import { X, Sparkles, TrendingUp, Globe, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { GscConnectedSnapshot, GscQueryItem } from '@/lib/gsc/types';

interface GscStrikingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQueryForExpansion: (query: string) => void;
  connectedSnapshot: GscConnectedSnapshot | null;
  onConnectDemo: () => Promise<void>;
  isLoadingGsc: boolean;
}

export const GscStrikingModal: React.FC<GscStrikingModalProps> = ({
  isOpen,
  onClose,
  onSelectQueryForExpansion,
  connectedSnapshot,
  onConnectDemo,
  isLoadingGsc,
}) => {
  if (!isOpen) return null;

  const queries = connectedSnapshot?.strikingDistanceQueries || [];

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
                Google Search Console &bull; Striking Distance Queries
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Page 2 &rarr; Page 1
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Queries in positions 11&ndash;25 with real search impressions. Expand with autocomplete to rank on Page 1.
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
          {!connectedSnapshot ? (
            /* Disconnected / Connect GSC State */
            <div className="text-center py-8 px-4 space-y-6 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Globe className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900">
                  Connect Your Google Search Console
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlock real impressions, average ranking positions, and Page-2 striking distance queries to optimize your existing site.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={onConnectDemo}
                  disabled={isLoadingGsc}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoadingGsc ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Explore with Demo Data (trailgearhub.com)</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Read-only access &bull; Zero data shared</span>
              </div>
            </div>
          ) : (
            /* Connected GSC Striking Distance List */
            <div className="space-y-4">
              {/* Domain Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Property: <strong className="text-slate-900">{connectedSnapshot.property}</strong></span>
                  {connectedSnapshot.demo && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                      Demo Data
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {queries.length} Page-2 Opportunities Found
                </div>
              </div>

              {/* Striking Distance Cards List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {queries.map((item: GscQueryItem, idx: number) => (
                  <div
                    key={`${item.query}-${idx}`}
                    className="p-4 bg-white hover:bg-emerald-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.query}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Pos #{item.position}
                        </span>
                      </div>
                      {item.page && (
                        <p className="text-[11px] text-slate-400 truncate max-w-md">
                          Ranking URL: {item.page}
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
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Powered by Google Search Console &bull; Striking Distance Algorithm
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
