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
  const { workspace, leads } = useApp();

  const dueFollowUps = leads.filter(l => {
    if (!l.next_follow_up_at || l.is_dead) return false;
    const due = new Date(l.next_follow_up_at);
    return due <= new Date();
  }).length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 md:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
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
