'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, Building2, Calendar, FileText, 
  FolderCheck, Calculator, Megaphone, BarChart3, 
  Settings, ExternalLink, Sparkles, RefreshCw, ShieldCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/leads', label: 'Leads CRM', icon: Users, badgeKey: 'leads' },
  { href: '/properties', label: 'Inventory', icon: Building2 },
  { href: '/visits', label: 'Site Visits', icon: Calendar },
  { href: '/deals', label: 'Deals & GST Invoices', icon: FileText },
  { href: '/documents', label: 'Document Vault', icon: FolderCheck },
  { href: '/calculators', label: 'Calculators', icon: Calculator },
  { href: '/marketing', label: 'Marketing Kit', icon: Megaphone },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { workspace, plan, loadDemoData, leads } = useApp();

  const dueFollowUps = leads.filter(l => {
    if (!l.next_follow_up_at || l.is_dead) return false;
    const due = new Date(l.next_follow_up_at);
    const today = new Date();
    return due <= today;
  }).length;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white min-h-screen fixed left-0 top-0 bottom-0 z-30">
      {/* Brand & Workspace */}
      <div className="p-4 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-teal-700/20">
            Y
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
              YAGHAR
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                IN
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[150px]">
              {workspace.name}
            </p>
          </div>
        </Link>
        {workspace.rera_number && (
          <div className="mt-2.5 px-2 py-1 bg-amber-50 rounded border border-amber-200/80 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="truncate">RERA: {workspace.rera_number}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-teal-50 text-teal-800 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span>{item.label}</span>
              </div>
              {item.badgeKey === 'leads' && dueFollowUps > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                  {dueFollowUps}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Public Microsite link */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <a
          href={`/c/${workspace.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Public Microsite</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Plan card & Demo Data button */}
        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span>{plan.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 uppercase font-bold">
              {workspace.plan_tier}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {leads.length} / {plan.limits.maxLeads} leads used
          </p>

          <button
            onClick={() => loadDemoData()}
            className="mt-2.5 w-full py-1.5 px-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            Reload Demo Data
          </button>
        </div>
      </div>
    </aside>
  );
}
