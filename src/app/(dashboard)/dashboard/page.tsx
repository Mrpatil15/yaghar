'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { formatINR, formatPhoneDisplay, formatDateTime, formatDate, getWhatsAppUrl } from '@/lib/formatters';
import { 
  Users, Building2, Calendar, FileText, Sparkles, 
  Phone, MessageSquare, Clock, ArrowRight, CheckCircle2, Plus 
} from 'lucide-react';
import Link from 'next/link';
import { AddLeadModal } from '@/components/crm/AddLeadModal';
import { WhatsAppShareModal } from '@/components/crm/WhatsAppShareModal';

export default function DashboardPage() {
  const { workspace, leads, properties, visits, deals } = useApp();
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLeadForWa, setSelectedLeadForWa] = useState<any>(null);

  // Follow-ups due today
  const dueFollowUps = leads.filter(l => {
    if (!l.next_follow_up_at || l.is_dead) return false;
    return new Date(l.next_follow_up_at) <= new Date();
  });

  // Upcoming visits
  const upcomingVisits = visits.filter(v => v.status === 'scheduled');

  // Total inventory value
  const inventoryValue = properties.reduce((acc, p) => acc + p.price, 0);

  // Total commission
  const totalCommission = deals.reduce((acc, d) => acc + d.total_commission, 0);

  return (
    <div className="space-y-6">
      <Header
        title={`Namaste, ${workspace.name}`}
        subtitle={`Brokerage Command Center • ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        onOpenAddLead={() => setIsAddLeadOpen(true)}
      />

      <div className="px-4 md:px-8 max-w-6xl mx-auto space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            href="/leads"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Leads</span>
              <Users className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{leads.length}</div>
            <span className="text-[11px] text-teal-700 font-semibold">{leads.filter(l => l.stage === 'site_visit' || l.stage === 'negotiation').length} in hot stages</span>
          </Link>

          <Link
            href="/properties"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Inventory Value</span>
              <Building2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatINR(inventoryValue)}</div>
            <span className="text-[11px] text-slate-500">{properties.length} active listings</span>
          </Link>

          <Link
            href="/visits"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Site Visits</span>
              <Calendar className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{upcomingVisits.length}</div>
            <span className="text-[11px] text-amber-700 font-semibold">Scheduled this week</span>
          </Link>

          <Link
            href="/deals"
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Pipeline Brokerage</span>
              <FileText className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{formatINR(totalCommission)}</div>
            <span className="text-[11px] text-slate-500">{deals.length} deals in progress</span>
          </Link>
        </div>

        {/* Morning Action Center: Follow-ups Due Today */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-900">Follow-Ups Due Today ({dueFollowUps.length})</h3>
            </div>
            <Link href="/leads?filter=due" className="text-xs text-teal-700 font-semibold hover:underline">
              View all in CRM →
            </Link>
          </div>

          {dueFollowUps.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              🎉 Great job! No pending follow-ups due today.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dueFollowUps.map(lead => (
                <div key={lead.id} className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 hover:bg-white hover:shadow-xs transition-all space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{lead.name}</h4>
                      <p className="text-[11px] text-slate-500">{formatPhoneDisplay(lead.phone)}</p>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 uppercase">
                      {lead.stage}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    Looking for: <strong>{lead.preferred_bhk.join('/') || 'Property'}</strong> in {lead.preferred_localities[0] || 'Mumbai'}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                    <button
                      onClick={() => setSelectedLeadForWa(lead)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two column layout: Site visits & Quick tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Site Visits */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Upcoming Site Visits ({upcomingVisits.length})</h3>
              </div>
              <Link href="/visits" className="text-xs text-teal-700 font-semibold hover:underline">
                View Calendar →
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingVisits.slice(0, 3).map(v => {
                const lead = leads.find(l => l.id === v.lead_id);
                const prop = properties.find(p => p.id === v.property_id);
                return (
                  <div key={v.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{lead?.name || 'Client'}</div>
                      <div className="text-[11px] text-slate-500">{prop?.title} ({prop?.locality})</div>
                      <div suppressHydrationWarning className="text-[11px] text-teal-700 font-semibold mt-0.5">{formatDateTime(v.scheduled_at)}</div>
                    </div>
                    <Link
                      href="/visits"
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      Details
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Real Estate Tools */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Consultant Tools & Shortcuts
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/calculators"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Calculators</div>
                <div className="text-[11px] text-slate-500">EMI, Stamp Duty & Brokerage</div>
              </Link>

              <Link
                href="/marketing"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Marketing Kit</div>
                <div className="text-[11px] text-slate-500">Flyers, AI Captions & Reels</div>
              </Link>

              <Link
                href="/documents"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Document Vault</div>
                <div className="text-[11px] text-slate-500">Index II & 7/12 Checklists</div>
              </Link>

              <a
                href={`/c/${workspace.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Public Microsite</div>
                <div className="text-[11px] text-slate-500">Share your branded page</div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
      />

      {selectedLeadForWa && (
        <WhatsAppShareModal
          isOpen={!!selectedLeadForWa}
          initialLead={selectedLeadForWa}
          onClose={() => setSelectedLeadForWa(null)}
        />
      )}
    </div>
  );
}
