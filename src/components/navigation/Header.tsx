'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, Plus, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenAddLead?: () => void;
  onOpenShareModal?: () => void;
}

export function Header({ title, subtitle, onOpenAddLead, onOpenShareModal }: HeaderProps) {
  const { workspace, leads, dbStatus } = useApp();

  const dueFollowUps = leads.filter(l => {
    if (!l.next_follow_up_at || l.is_dead) return false;
    const due = new Date(l.next_follow_up_at);
    return due <= new Date();
  }).length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 md:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href="/settings#database"
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              dbStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : dbStatus === 'checking'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={dbStatus === 'connected' ? 'Connected to Supabase PostgreSQL' : 'Using Local Storage / Demo Mode (Click to configure)'}
          >
            <span className={`w-2 h-2 rounded-full ${
              dbStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : dbStatus === 'checking'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-slate-400'
            }`} />
            <span>{dbStatus === 'connected' ? 'Cloud DB Active' : dbStatus === 'checking' ? 'Connecting DB...' : 'Local Demo DB'}</span>
          </Link>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          {dueFollowUps > 0 && (
            <Link
              href="/leads?filter=due"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
              title="Follow-ups due today"
            >
              <Bell className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span>{dueFollowUps} Due Today</span>
            </Link>
          )}

          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Quick WhatsApp Share"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp Share</span>
            </button>
          )}

          {onOpenAddLead && (
            <button
              onClick={onOpenAddLead}
              className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Lead</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
