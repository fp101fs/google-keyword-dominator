'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import {
  SavedActionItem,
  getSavedSprintItems,
  removeSprintItem,
  clearAllSprintItems,
} from '@/lib/action-cart';
import {
  BookmarkCheck,
  X,
  Copy,
  Check,
  Trash2,
  Download,
  FileText,
  Sparkles,
  Compass,
  Target,
  ChevronUp,
} from 'lucide-react';

function subscribeToSprint(callback: () => void) {
  window.addEventListener('gkd_sprint_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('gkd_sprint_updated', callback);
    window.removeEventListener('storage', callback);
  };
}

function getSprintSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  return localStorage.getItem('gkd_saved_sprint_items') || '[]';
}

function getSprintServerSnapshot(): string {
  return '[]';
}

export const ActionCartDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rawItems = useSyncExternalStore(
    subscribeToSprint,
    getSprintSnapshot,
    getSprintServerSnapshot
  );

  let items: SavedActionItem[] = [];
  try {
    items = JSON.parse(rawItems);
  } catch {
    items = [];
  }

  const handleCopy = async (item: SavedActionItem) => {
    await navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = async () => {
    const combined = items
      .map(
        (it, idx) =>
          `# ${idx + 1}. [${it.type.toUpperCase()}] ${it.title}\n${it.subtitle ? `> ${it.subtitle}\n\n` : ''}${it.content}\n\n---\n`
      )
      .join('\n');

    await navigator.clipboard.writeText(combined);
    setCopiedId('ALL');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportSprint = () => {
    if (items.length === 0) return;

    const combined = `# GKD Content Sprint & Saved Actions Export
Generated on ${new Date().toLocaleDateString()} &bull; Total Items: ${items.length}

${items
  .map(
    (it, idx) =>
      `## ${idx + 1}. [${it.type.replace('_', ' ').toUpperCase()}] ${it.title}
${it.subtitle ? `*Context: ${it.subtitle}*\n` : ''}
${it.content}

---`
  )
  .join('\n\n')}
`;

    const blob = new Blob([combined], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gkd-content-sprint-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getItemIcon = (type: SavedActionItem['type']) => {
    switch (type) {
      case 'opportunity_action':
        return <Compass className="w-4 h-4 text-blue-600" />;
      case 'content_brief':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'keyword_gap':
        return <Target className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <>
      {/* Sticky Bottom Trigger Bar */}
      <div className="fixed bottom-4 right-4 z-40 animate-fadeIn">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl border border-slate-700 transition-all cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
            <BookmarkCheck className="w-3.5 h-3.5" />
          </div>
          <span>Action Sprint</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px]">
            {items.length}
          </span>
          <ChevronUp className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Slide-Up Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-slideLeft">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-950 to-indigo-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Action Sprint &amp; Saved Items
                    <span className="text-[10px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200">
                    Saved briefs, actions, and keyword gaps ready for execution.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
              {items.length === 0 ? (
                <div className="py-16 text-center space-y-3 max-w-xs mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <BookmarkCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Your Sprint is Empty</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Click <strong className="text-slate-700">&quot;Save to Sprint&quot;</strong> on any Content Brief, Next 100 Win, or Keyword Gap to pin it here.
                    </p>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-2xs space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-1.5 bg-slate-50 rounded-lg shrink-0 mt-0.5">
                          {getItemIcon(item.type)}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Copy Item Content"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => removeSprintItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 line-clamp-3 font-mono border border-slate-100 whitespace-pre-wrap">
                      {item.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-2">
                <button
                  onClick={clearAllSprintItems}
                  className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear All
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === 'ALL' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy All</span>
                  </button>

                  <button
                    onClick={handleExportSprint}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sprint (.md)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
