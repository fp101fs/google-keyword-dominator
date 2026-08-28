'use client';

import React from 'react';
import { PLATFORMS, PlatformType } from '@/lib/platforms';
import { Search, Video, ShoppingBag, Globe } from 'lucide-react';

interface PlatformTabsProps {
  activePlatform: PlatformType;
  onChange: (platform: PlatformType) => void;
  disabled?: boolean;
}

export const PlatformTabs: React.FC<PlatformTabsProps> = ({
  activePlatform,
  onChange,
  disabled = false,
}) => {
  const getIcon = (id: PlatformType) => {
    switch (id) {
      case 'google':
        return <Search className="w-4 h-4" />;
      case 'youtube':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'amazon':
        return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'bing':
        return <Globe className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto">
      {PLATFORMS.map((platform) => {
        const isActive = activePlatform === platform.id;
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onChange(platform.id)}
            disabled={disabled}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getIcon(platform.id)}
            <span>{platform.name}</span>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-medium px-1.5 py-0.2 bg-slate-50 rounded">
              {platform.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
};
