'use client';

import React from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/formatters';
import { 
  BarChart3, TrendingUp, Users, Target, Clock, 
  IndianRupee, Megaphone, ArrowUpRight, CheckCircle2 
} from 'lucide-react';

export default function AnalyticsPage() {
  const { leads, deals, properties } = useApp();

  // Sources breakdown
  const sourceCounts: Record<string, number> = {};
  leads.forEach(l => {
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });

  const totalLeads = leads.length || 1;

  // Stages count
  const newCount = leads.filter(l => l.stage === 'new').length;
  const contactedCount = leads.filter(l => l.stage === 'contacted').length;
  const visitCount = leads.filter(l => l.stage === 'site_visit').length;
  const negoCount = leads.filter(l => l.stage === 'negotiation').length;
  const bookedCount = leads.filter(l => l.stage === 'booked').length;
  const lostCount = leads.filter(l => l.stage === 'lost').length;

  // Commission pipeline
  const totalCommission = deals.reduce((acc, d) => acc + d.total_commission, 0);
  const receivedCommission = deals.reduce((acc, d) => acc + d.received_amount, 0);

  // Ad sources mock data for CPL
  const adSources = [
    { platform: 'Meta (FB/IG) Ads', spend: 25000, leads: 32, cpl: 781 },
    { platform: 'Google Search Ads', spend: 35000, leads: 28, cpl: 1250 },
    { platform: '99acres Listing Pack', spend: 20000, leads: 22, cpl: 909 },
    { platform: 'MagicBricks Featured', spend: 18000, leads: 19, cpl: 947 },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Business Analytics & Funnel"
        subtitle="Track conversion rates, lead sources, and cost per lead"
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Active Pipeline</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{leads.length} Leads</div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +18% this month
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Conversion Rate</span>
            <div className="text-2xl font-black text-teal-800 mt-1">
              {Math.round((bookedCount / totalLeads) * 100)}%
            </div>
            <span className="text-[11px] text-slate-400">Leads to Booked Deals</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Average Response Time</span>
            <div className="text-2xl font-black text-slate-900 mt-1">14 Mins</div>
            <span className="text-[11px] text-emerald-600 font-semibold">92% within 1 hour</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Expected Commission</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{formatINR(totalCommission)}</div>
            <span className="text-[11px] text-slate-400">{formatINR(receivedCommission)} received</span>
          </div>
        </div>

        {/* Funnel & Sources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Conversion */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-700" />
              <span>Lead-to-Deal Conversion Funnel</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { stage: 'New Inquiries', count: newCount, color: 'bg-blue-500' },
                { stage: 'Contacted & Qualified', count: contactedCount, color: 'bg-purple-500' },
                { stage: 'Site Visits Conducted', count: visitCount, color: 'bg-amber-500' },
                { stage: 'Under Negotiation', count: negoCount, color: 'bg-orange-500' },
                { stage: 'Deals Booked / Won', count: bookedCount, color: 'bg-emerald-600' },
                { stage: 'Lost / Inactive', count: lostCount, color: 'bg-slate-400' },
              ].map(item => {
                const pct = Math.round((item.count / totalLeads) * 100);
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">{item.stage}</span>
                      <span className="text-slate-900">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sources Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-700" />
              <span>Leads by Acquisition Source</span>
            </h3>

            <div className="space-y-3 text-xs">
              {Object.entries(sourceCounts).map(([src, count]) => {
                const pct = Math.round((count / totalLeads) * 100);
                return (
                  <div key={src} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="capitalize text-slate-700">{src.replace('_', ' ')}</span>
                      <span className="text-slate-900">{count} leads ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cost Per Lead (CPL) Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Paid Ad Sources & Cost Per Lead (CPL)</h3>
              <p className="text-xs text-slate-500">Track acquisition efficiency across Meta, Google & Portals</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Avg. CPL: ₹ 945
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                <tr>
                  <th className="p-3">Platform</th>
                  <th className="p-3 text-right">Ad Spend (INR)</th>
                  <th className="p-3 text-right">Leads Generated</th>
                  <th className="p-3 text-right">Cost Per Lead (CPL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adSources.map(ad => (
                  <tr key={ad.platform} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{ad.platform}</td>
                    <td className="p-3 text-right font-mono">{formatINR(ad.spend)}</td>
                    <td className="p-3 text-right font-mono font-bold">{ad.leads}</td>
                    <td className="p-3 text-right font-mono font-bold text-teal-800">
                      ₹ {ad.cpl.toLocaleString('en-IN')}
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
