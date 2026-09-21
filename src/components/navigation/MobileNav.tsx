'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, Plus, Building2, Menu, X, 
  Calendar, FileText, FolderCheck, Calculator, 
  Megaphone, BarChart3, Settings, ExternalLink, RefreshCw 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './DesktopSidebar';

export function MobileNav({ onOpenQuickAdd }: { onOpenQuickAdd?: () => void }) {
  const pathname = usePathname();
  const { workspace, leads, loadDemoData } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dueFollowUps = leads.filter(l => {
    if (!l.next_follow_up_at || l.is_dead) return false;
    const due = new Date(l.next_follow_up_at);
    return due <= new Date();
  }).length;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] py-1 text-[11px] font-medium transition-colors",
            pathname === '/dashboard' ? "text-teal-700 font-bold" : "text-slate-500"
          )}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          href="/leads"
          className={cn(
            "relative flex flex-col items-center justify-center min-w-[56px] py-1 text-[11px] font-medium transition-colors",
            pathname.startsWith('/leads') ? "text-teal-700 font-bold" : "text-slate-500"
          )}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Leads</span>
          {dueFollowUps > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {dueFollowUps}
            </span>
          )}
        </Link>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex flex-col items-center justify-center -mt-5"
          aria-label="Add New"
        >
          <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-700/30 hover:bg-teal-800 active:scale-95 transition-all">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-slate-700 mt-0.5">Add</span>
        </button>

        <Link
          href="/properties"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] py-1 text-[11px] font-medium transition-colors",
            pathname.startsWith('/properties') ? "text-teal-700 font-bold" : "text-slate-500"
          )}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span>Inventory</span>
        </Link>

        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] py-1 text-[11px] font-medium text-slate-500",
            drawerOpen && "text-teal-700"
          )}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Drawer / Slide-over */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs md:hidden animate-fade-in">
          <div className="bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">{workspace.name}</h3>
                <p className="text-xs text-slate-500">{workspace.city} • {workspace.plan_tier.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-teal-700" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={`/c/${workspace.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800"
              >
                <span>View Public Microsite</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  loadDemoData();
                  setDrawerOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
