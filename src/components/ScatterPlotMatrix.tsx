'use client';

import React, { useState, useMemo } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { ScatterChart, Copy, Check, Info } from 'lucide-react';
import { INTENT_DEFINITIONS } from '@/lib/intent';

interface ScatterPlotMatrixProps {
  seed: string;
  keywords: KeywordItem[];
}

export const ScatterPlotMatrix: React.FC<ScatterPlotMatrixProps> = ({ seed, keywords }) => {
  const [hoveredKeyword, setHoveredKeyword] = useState<KeywordItem | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string>('all');

  const filtered = useMemo(() => {
    if (selectedIntent === 'all') return keywords.slice(0, 150); // limit to top 150 for clean scatter distribution
    return keywords.filter((k) => k.intent === selectedIntent).slice(0, 150);
  }, [keywords, selectedIntent]);

  const handleCopy = async (kw: string) => {
    await navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 1500);
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'transactional':
        return '#10b981'; // emerald
      case 'commercial':
        return '#8b5cf6'; // purple
      case 'informational':
        return '#3b82f6'; // blue
      case 'navigational':
        return '#f59e0b'; // amber
      default:
        return '#64748b'; // slate
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <ScatterChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              2D Keyword Opportunity Scatter Plot
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                Opportunity Quadrant
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive 2D matrix for &quot;<strong>{seed}</strong>&quot;. Isolate low-hanging fruit in the <strong>High Score + Low AP</strong> quadrant.
            </p>
          </div>
        </div>

        {/* Intent Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedIntent('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedIntent === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({keywords.length})
          </button>
          {(Object.keys(INTENT_DEFINITIONS) as (keyof typeof INTENT_DEFINITIONS)[]).map((key) => {
            const def = INTENT_DEFINITIONS[key];
            const isSelected = selectedIntent === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedIntent(key)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  isSelected ? 'bg-blue-600 text-white shadow-2xs' : `${def.badgeClass} hover:opacity-80`
                }`}
              >
                {def.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quadrant Explanation Alert */}
      <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong>How to read this plot:</strong> The <strong>Top-Left Quadrant</strong> represents prime opportunity (Score &ge; 70% and AP &le; 3rd rank). Dot size corresponds to word length. Hover or click any dot to copy the keyword.
        </p>
      </div>

      {/* SVG Scatter Chart Canvas */}
      <div className="relative bg-slate-900 rounded-2xl p-4 sm:p-6 overflow-hidden select-none">
        {/* Quadrant Labels Overlay */}
        <div className="absolute top-6 left-12 text-[10px] font-black uppercase tracking-widest text-emerald-400/70 pointer-events-none">
          ★ High Score &bull; Low AP (Sweet Spot)
        </div>
        <div className="absolute top-6 right-10 text-[10px] font-bold uppercase tracking-widest text-amber-400/50 pointer-events-none">
          High Score &bull; High AP
        </div>
        <div className="absolute bottom-10 left-12 text-[10px] font-bold uppercase tracking-widest text-slate-500/50 pointer-events-none">
          Low Score &bull; Low AP
        </div>
        <div className="absolute bottom-10 right-10 text-[10px] font-bold uppercase tracking-widest text-slate-600/50 pointer-events-none">
          Long-Tail Discovery
        </div>

        {/* SVG Visualization */}
        <div className="w-full aspect-[16/9] max-h-[420px] min-h-[280px]">
          <svg viewBox="0 0 800 450" className="w-full h-full">
            {/* Grid Lines */}
            <line x1="60" y1="50" x2="60" y2="400" stroke="#334155" strokeWidth="1" />
            <line x1="60" y1="400" x2="760" y2="400" stroke="#334155" strokeWidth="1" />

            {/* Quadrant Dividers */}
            <line x1="410" y1="50" x2="410" y2="400" stroke="#475569" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="60" y1="225" x2="760" y2="225" stroke="#475569" strokeDasharray="4 4" strokeWidth="1" />

            {/* Y Axis Labels (Relative Score: 0 - 100) */}
            <text x="20" y="55" fill="#94a3b8" fontSize="11" fontWeight="bold">100%</text>
            <text x="28" y="230" fill="#64748b" fontSize="10">50%</text>
            <text x="35" y="400" fill="#64748b" fontSize="10">0%</text>
            <text x="-250" y="20" fill="#94a3b8" fontSize="11" fontWeight="bold" transform="rotate(-90)" textAnchor="middle">
              Relative Score &uarr;
            </text>

            {/* X Axis Labels (Autocomplete Placement: 1st to 15th) */}
            <text x="60" y="425" fill="#94a3b8" fontSize="11" fontWeight="bold">AP 1st</text>
            <text x="410" y="425" fill="#64748b" fontSize="10" textAnchor="middle">AP 8th</text>
            <text x="750" y="425" fill="#64748b" fontSize="10" textAnchor="end">AP 15th+</text>
            <text x="410" y="445" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
              Autocomplete Placement (AP Rank) &rarr;
            </text>

            {/* Keyword Scatter Circles */}
            {filtered.map((item, idx) => {
              // Map AP (1 to 15) to X (80 to 740)
              const cx = 80 + Math.min(14, item.ap - 1) * (660 / 14);
              // Map Score (0 to 100) to Y (390 down to 60)
              const cy = 390 - (item.relativeScore / 100) * 330;
              // Radius by word count (min 5, max 10)
              const r = Math.min(10, Math.max(5, item.wordCount * 1.8));
              const color = getIntentColor(item.intent);
              const isHovered = hoveredKeyword?.keyword === item.keyword;

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? r + 4 : r}
                  fill={color}
                  fillOpacity={isHovered ? 1 : 0.75}
                  stroke={isHovered ? '#ffffff' : color}
                  strokeWidth={isHovered ? 3 : 1}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredKeyword(item)}
                  onClick={() => handleCopy(item.keyword)}
                />
              );
            })}
          </svg>
        </div>

        {/* Hovered Keyword Card Overlay */}
        {hoveredKeyword && (
          <div className="absolute bottom-4 right-4 bg-slate-800/95 border border-slate-700 backdrop-blur-md rounded-xl p-3.5 text-white text-xs max-w-xs shadow-2xl space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm text-blue-300 truncate">
                {hoveredKeyword.keyword}
              </span>
              <button
                onClick={() => handleCopy(hoveredKeyword.keyword)}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                title="Copy keyword"
              >
                {copiedKeyword === hoveredKeyword.keyword ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span>Score: <strong className="text-white">{hoveredKeyword.relativeScore}%</strong></span>
              <span>&bull;</span>
              <span>AP: <strong className="text-blue-300">{hoveredKeyword.apFormatted}</strong></span>
              <span>&bull;</span>
              <span>Diff: <strong className="text-amber-300">{hoveredKeyword.diff}</strong></span>
            </div>
            <div className="text-[10px] text-slate-400">
              Intent: <span className="text-slate-200 capitalize font-medium">{hoveredKeyword.intent}</span> | Words: {hoveredKeyword.wordCount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
