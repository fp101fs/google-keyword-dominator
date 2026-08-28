'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle, Loader2, Gauge, Globe } from 'lucide-react';

interface PageGraderDrawerProps {
  targetKeyword: string;
  isOpen: boolean;
  onClose: () => void;
}

interface GradeResult {
  url: string;
  score: number;
  details: {
    pageTitle: string;
    metaDesc: string;
    h1: string[];
    h2Count: number;
    wordCount: number;
    checks: { label: string; passed: boolean; tip: string }[];
  };
}

export const PageGraderDrawer: React.FC<PageGraderDrawerProps> = ({
  targetKeyword,
  isOpen,
  onClose,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/page-grader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), targetKeyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grade page');
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Audit failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                1-Click Page Grader &bull; SerpDo Engine
              </h3>
              <p className="text-xs text-slate-500">
                Audit any URL against target keyword: <strong className="text-slate-800">&quot;{targetKeyword}&quot;</strong>
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

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Audit URL Form */}
          <form onSubmit={handleGrade} className="space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Enter Live URL to Audit
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/blog/my-post"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Grade Page</span>}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Audit Results */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Overall Score Circle */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                    SEO + GEO Readiness Score
                  </span>
                  <div className="text-2xl font-black mt-1">
                    {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Moderate' : 'Needs Optimization'}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Word count: ~{result.details.wordCount} words &bull; H2 tags: {result.details.h2Count}
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-2 ${
                  result.score >= 80 ? 'border-emerald-400 text-emerald-400 bg-emerald-950/50' : 'border-amber-400 text-amber-400 bg-amber-950/50'
                }`}>
                  {result.score}
                </div>
              </div>

              {/* Actionable Checks List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Audit Checklist &amp; Recommendations
                </h4>
                <div className="space-y-2">
                  {result.details.checks.map((c, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                        c.passed
                          ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                          : 'bg-rose-50/60 border-rose-200 text-slate-800'
                      }`}
                    >
                      {c.passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{c.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${c.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {c.passed ? 'Passed' : 'Action Required'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{c.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant heuristic analysis</span>
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
