'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { 
  Building2, ShieldCheck, Download, Users, 
  CreditCard, Check, Sparkles, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { workspace, setWorkspace, leads, properties, deals } = useApp();

  const [name, setName] = useState(workspace.name);
  const [city, setCity] = useState(workspace.city);
  const [phone, setPhone] = useState(workspace.phone || '');
  const [email, setEmail] = useState(workspace.email || '');
  const [reraNumber, setReraNumber] = useState(workspace.rera_number || '');
  const [brandColor, setBrandColor] = useState(workspace.brand_color || '#0f766e');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkspace({
      ...workspace,
      name: name.trim(),
      city: city.trim(),
      phone: phone.trim(),
      email: email.trim(),
      rera_number: reraNumber.trim() || null,
      brand_color: brandColor,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportData = () => {
    const data = {
      workspace,
      leads,
      properties,
      deals,
      exportedAt: new Date().toISOString(),
      compliance: 'India DPDP Act 2023 Compliant Export',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yaghar-export-${workspace.slug}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Workspace Settings"
        subtitle="Manage your agency profile, RERA credentials, and data privacy"
      />

      <div className="px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Quick links to Team & Billing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/settings/team"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Team Members & Invites</div>
              <div className="text-[11px] text-slate-500">Manage consultant seats and roles</div>
            </div>
          </Link>

          <Link
            href="/settings/billing"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Billing & Subscriptions</div>
              <div className="text-[11px] text-slate-500">Current plan: {workspace.plan_tier.toUpperCase()}</div>
            </div>
          </Link>
        </div>

        {/* Agency Profile Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <span>Brokerage Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Agency / Consultant Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating City</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official WhatsApp Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">RERA Agent Registration No.</label>
              <input
                type="text"
                placeholder="e.g. A51900012345"
                value={reraNumber}
                onChange={e => setReraNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Theme Color</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 p-0.5 cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-600">{brandColor}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* DPDP 2023 Data Portability & Export */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-sm text-slate-900">Data Portability (DPDP Act 2023)</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download a complete, machine-readable backup of all your client leads, property inventory, site visits, and deals. You own your data 100%.
          </p>

          <div className="pt-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-teal-700" />
              <span>Export All Workspace Data (JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
