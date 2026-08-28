'use client';

import React, { useState, useEffect } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import {
  X,
  Search,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  BarChart2,
  Loader2,
  AlertCircle,
  Gauge,
} from 'lucide-react';
import { PageGraderDrawer } from './PageGraderDrawer';

interface SerpResultItem {
  title: string;
  url: string;
  domain: string;
}

interface SerpInspectorDrawerProps {
  keywordItem: KeywordItem | null;
  onClose: () => void;
}

export const SerpInspectorDrawer: React.FC<SerpInspectorDrawerProps> = ({
  keywordItem,
  onClose,
}) => {
  const [results, setResults] = useState<SerpResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [gradeTargetUrl, setGradeTargetUrl] = useState<string | null>(null);

  const keywordText = keywordItem?.keyword || '';

  useEffect(() => {
    if (!keywordText) return;

    let isMounted = true;

    async function fetchSerp() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/serp-overlap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: [keywordText, `${keywordText} guide`] }),
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch SERP (Status: ${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          if (data.success && data.data?.serpMap?.[keywordText]) {
            setResults(data.data.serpMap[keywordText]);
          } else {
            setError('No live SERP results found for this keyword.');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Error fetching live SERP data';
          setError(msg);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSerp();

    return () => {
      isMounted = false;
    };
  }, [keywordText]);

  if (!keywordItem) return null;

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getDifficultyAdvice = (diff: string) => {
    if (diff === 'Low') {
      return {
        badge: 'Low Competition (Easy Win)',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        advice:
          'High opportunity long-tail search query. Creating a focused 800+ word article or dedicated FAQ section with clear headings can easily reach Page 1 rankings quickly.',
      };
    }
    if (diff === 'Med') {
      return {
        badge: 'Moderate Competition (Medium KD)',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        advice:
          'Solid search volume and moderate competition. Requires a comprehensive guide targeting related questions, comparison tables, and strong internal links from your site’s pillar articles.',
      };
    }
    return {
      badge: 'High Competition Head Term (Hard KD)',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      advice:
        'High commercial intent query dominated by major authority domains. Best targeted as a cornerstone hub page while building topical authority through supporting long-tail cluster articles.',
    };
  };

  const diffGuidance = getDifficultyAdvice(keywordItem.diff);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-slideLeft">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 block">
                  Ahrefs SERP Overview
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate max-w-xs sm:max-w-md">
                  {keywordItem.keyword}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
                <span className="text-lg font-black text-slate-900">{keywordItem.relativeScore}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">AP Rank</span>
                <span className="text-lg font-black text-blue-600">{keywordItem.apFormatted}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Difficulty</span>
                <span className="text-lg font-black text-amber-600">{keywordItem.diff}</span>
              </div>
            </div>

            {/* Actionable Difficulty Guidance Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  Ahrefs-Style KD Guidance
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${diffGuidance.badgeColor}`}>
                  {diffGuidance.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{diffGuidance.advice}</p>
            </div>

            {/* Live SERP Overview (Top 10 Google Results) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Top 10 Live Search Results
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {results.length} URLs Discovered
                </span>
              </div>

              {isLoading && (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs font-medium">Fetching real-time Google search results...</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!isLoading && !error && results.length > 0 && (
                <div className="space-y-2.5">
                  {results.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all shadow-2xs space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-600">{res.domain}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setGradeTargetUrl(res.url)}
                            className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded flex items-center gap-1 cursor-pointer transition-colors"
                            title="Audit this ranking competitor URL"
                          >
                            <Gauge className="w-3 h-3 text-indigo-600" />
                            <span>Grade SEO</span>
                          </button>
                          <button
                            onClick={() => handleCopy(res.url)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                            title="Copy URL"
                          >
                            {copiedUrl === res.url ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Open page"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-700 hover:underline block leading-snug"
                      >
                        {res.title}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Live SERP Data Powered by Jina
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Cross-linked Live Page Grader for any SERP result */}
      {gradeTargetUrl && (
        <PageGraderDrawer
          isOpen={!!gradeTargetUrl}
          onClose={() => setGradeTargetUrl(null)}
          initialUrl={gradeTargetUrl}
          targetKeyword={keywordItem.keyword}
        />
      )}
    </>
  );
};
