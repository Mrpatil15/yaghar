'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ListingType } from '@/types/database.types';

interface PropertyFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  selectedBhk: string;
  onBhkChange: (b: string) => void;
  maxBudgetLakh: string;
  onMaxBudgetChange: (b: string) => void;
  onReset: () => void;
}

const BHK_LIST = ['All', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
const TYPE_LIST = [
  { value: 'all', label: 'All Listings' },
  { value: 'resale', label: 'Resale' },
  { value: 'new_project', label: 'New Projects' },
  { value: 'rental', label: 'Rentals' },
];

export function PropertyFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedBhk,
  onBhkChange,
  maxBudgetLakh,
  onMaxBudgetChange,
  onReset,
}: PropertyFiltersProps) {
  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedBhk !== 'All' || maxBudgetLakh;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by project name, locality, or RERA ID..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Listing Type tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {TYPE_LIST.map(t => (
            <button
              key={t.value}
              onClick={() => onTypeChange(t.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedType === t.value
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary filters row: BHK & Budget */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">BHK:</span>
          {BHK_LIST.map(bhk => (
            <button
              key={bhk}
              onClick={() => onBhkChange(bhk)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedBhk === bhk
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {bhk}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Max Budget:</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
              <input
                type="number"
                placeholder="Max (Lakhs)"
                value={maxBudgetLakh}
                onChange={e => onMaxBudgetChange(e.target.value)}
                className="w-28 pl-6 pr-2 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
