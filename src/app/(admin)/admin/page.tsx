'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Workspace } from '@/types/database.types';
import { formatINR, formatDate } from '@/lib/formatters';
import { 
  Building2, Users, IndianRupee, ShieldCheck, 
  ExternalLink, UserCheck, Clock, ArrowLeft, RefreshCw, Sparkles 
} from 'lucide-react';

const MOCK_TENANTS: Workspace[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Shree Ganesh Realty',
    slug: 'shree-ganesh-realty',
    brand_color: '#0f766e',
    phone: '+919820123456',
    email: 'contact@shreeganeshrealty.in',
    city: 'Mumbai',
    focus_localities: ['Borivali East', 'Kandivali West', 'Thane West'],
    rera_number: 'A51900012345',
    plan_tier: 'pro',
    trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    subscription_status: 'active',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Pune Prime Properties',
    slug: 'pune-prime',
    brand_color: '#2563eb',
    phone: '+919890112233',
    email: 'info@puneprime.com',
    city: 'Pune',
    focus_localities: ['Wakad', 'Baner', 'Hinjawadi', 'Kharadi'],
    rera_number: 'A52100099881',
    plan_tier: 'starter',
    trial_ends_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    subscription_status: 'active',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Skyline Estates Bangalore',
    slug: 'skyline-bangalore',
    brand_color: '#7c3aed',
    phone: '+919880556677',
    email: 'support@skylineestates.in',
    city: 'Bengaluru',
    focus_localities: ['Whitefield', 'Indiranagar', 'Sarjapur Road'],
    rera_number: 'PRM/KA/RERA/1251/446',
    plan_tier: 'team',
    trial_ends_at: new Date(Date.now() + 20 * 86400000).toISOString(),
    subscription_status: 'active',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    name: 'Gurugram Luxury Real Estate',
    slug: 'gurugram-luxury',
    brand_color: '#b91c1c',
    phone: '+919811445566',
    email: 'deals@gurugramluxury.com',
    city: 'Gurugram',
    focus_localities: ['Golf Course Road', 'DLF Phase 5', 'Cyber City'],
    rera_number: 'HRERA-GGM-2023-441',
    plan_tier: 'trial',
    trial_ends_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    subscription_status: 'trialing',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function SuperAdminPage() {
  const router = useRouter();
  const { workspace, setWorkspace } = useApp();
  const [tenants, setTenants] = useState<Workspace[]>(MOCK_TENANTS);
  const [impersonateMsg, setImpersonateMsg] = useState<string | null>(null);

  // Total MRR calculation
  const totalMRR = tenants.reduce((acc, t) => {
    if (t.subscription_status !== 'active') return acc;
    if (t.plan_tier === 'starter') return acc + 999;
    if (t.plan_tier === 'pro') return acc + 2499;
    if (t.plan_tier === 'team') return acc + 4999;
    return acc;
  }, 0);

  const activeSubscribers = tenants.filter(t => t.subscription_status === 'active').length;
  const trialingCount = tenants.filter(t => t.subscription_status === 'trialing').length;

  const handleImpersonate = (tenant: Workspace) => {
    setWorkspace(tenant);
    setImpersonateMsg(`Switched active context to ${tenant.name}. Redirecting to dashboard...`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  const handleExtendTrial = (tenantId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      const newExpiry = new Date(new Date(t.trial_ends_at).getTime() + 14 * 86400000).toISOString();
      return { ...t, trial_ends_at: newExpiry };
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black">YAGHAR Super Admin</h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500 text-white font-bold uppercase tracking-wider">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage all tenant workspaces, MRR, trials, and customer support</p>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Current Workspace: <span className="font-bold text-teal-400">{workspace.name}</span>
          </div>
        </div>

        {impersonateMsg && (
          <div className="p-4 bg-teal-900/80 border border-teal-500 rounded-2xl text-xs text-teal-200 font-semibold animate-fade-in flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-400" />
            <span>{impersonateMsg}</span>
          </div>
        )}

        {/* Global Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total MRR</span>
            <div className="text-2xl font-black text-emerald-400">₹ {totalMRR.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-slate-500">Monthly Recurring Revenue</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Tenants</span>
            <div className="text-2xl font-black text-white">{tenants.length}</div>
            <span className="text-[11px] text-slate-500">Across 4 major cities</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Paid Plans</span>
            <div className="text-2xl font-black text-teal-400">{activeSubscribers}</div>
            <span className="text-[11px] text-slate-500">Paying via Razorpay</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Free Trials</span>
            <div className="text-2xl font-black text-amber-400">{trialingCount}</div>
            <span className="text-[11px] text-slate-500">14-day evaluation</span>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-slate-800/60 rounded-3xl border border-slate-700 overflow-hidden space-y-4 p-6">
          <h2 className="text-base font-bold text-white">Registered Consultant Workspaces</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">Workspace / Agency</th>
                  <th className="p-3">City & RERA</th>
                  <th className="p-3">Plan Tier</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Trial Expiry</th>
                  <th className="p-3 text-right">Support Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {tenants.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{t.name}</div>
                      <div className="text-[11px] text-slate-400">{t.email} • {t.phone}</div>
                    </td>
                    <td className="p-3">
                      <div>{t.city}</div>
                      {t.rera_number && (
                        <div className="text-[10px] text-amber-400 font-mono">RERA: {t.rera_number}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-700 text-teal-300 font-bold uppercase text-[10px]">
                        {t.plan_tier}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.subscription_status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {t.subscription_status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {formatDate(t.trial_ends_at)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleExtendTrial(t.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors"
                          title="Add 14 days to trial"
                        >
                          +14 Days
                        </button>
                        <button
                          onClick={() => handleImpersonate(t)}
                          className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Impersonate</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
