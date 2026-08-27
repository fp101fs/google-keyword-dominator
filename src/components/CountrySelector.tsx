'use client';

import React from 'react';
import { COUNTRIES, Country } from '@/lib/countries';
import { Globe2 } from 'lucide-react';

interface CountrySelectorProps {
  selectedCountry: string;
  onChange: (countryCode: string) => void;
  disabled?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <label htmlFor="country-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
        <Globe2 className="w-3.5 h-3.5 text-slate-400" />
        Target Country
      </label>
      <div className="relative">
        <select
          id="country-select"
          value={selectedCountry}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-sm font-medium rounded-xl py-2.5 pl-3.5 pr-10 shadow-xs transition-all disabled:opacity-50 disabled:bg-slate-50 cursor-pointer"
        >
          {COUNTRIES.map((c: Country) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
