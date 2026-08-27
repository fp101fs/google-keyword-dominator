'use client';

import React, { useState } from 'react';
import { Check, FileSpreadsheet, Copy } from 'lucide-react';
import { KeywordItem } from '@/lib/autocomplete';
import { generateKeywordsCsv, sanitizeFilename } from '@/lib/csv';

interface ExportButtonProps {
  seed: string;
  keywords: KeywordItem[];
  country: string;
  language: string;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  seed,
  keywords,
  country,
  language,
  disabled = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadCsv = () => {
    if (keywords.length === 0) return;
    const csvContent = generateKeywordsCsv(seed, keywords, country, language);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `google_keywords_${sanitizeFilename(seed)}_${country.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleCopyKeywords = async () => {
    if (keywords.length === 0) return;
    const textList = keywords.map((k) => k.keyword).join('\n');
    await navigator.clipboard.writeText(textList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Copy plain list */}
      <button
        onClick={handleCopyKeywords}
        disabled={disabled || keywords.length === 0}
        title="Copy keywords to clipboard"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600">Copied {keywords.length}!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy ({keywords.length})</span>
          </>
        )}
      </button>

      {/* Download CSV */}
      <button
        onClick={handleDownloadCsv}
        disabled={disabled || keywords.length === 0}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {downloaded ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exported!</span>
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" />
            <span>Export CSV</span>
          </>
        )}
      </button>
    </div>
  );
};
