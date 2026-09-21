'use client';

import React, { useState } from 'react';
import { Lead, LeadStage } from '@/types/database.types';
import { formatINR, formatPhoneDisplay, getWhatsAppUrl } from '@/lib/formatters';
import { Phone, MessageSquare, Calendar, ChevronDown, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

interface LeadCardProps {
  lead: Lead;
  onOpenWhatsApp?: (lead: Lead) => void;
  onOpenScheduleVisit?: (lead: Lead) => void;
}

const STAGES: { value: LeadStage; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'booked', label: 'Booked' },
  { value: 'lost', label: 'Lost' },
];

export function LeadCard({ lead, onOpenWhatsApp, onOpenScheduleVisit }: LeadCardProps) {
  const { updateLeadStage, getMatchingPropertiesForLead } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isDueToday = lead.next_follow_up_at && new Date(lead.next_follow_up_at) <= new Date() && !lead.is_dead;
  const matches = getMatchingPropertiesForLead(lead);

  const budgetDisplay = lead.budget_min && lead.budget_max
    ? `${formatINR(lead.budget_min, { showUnitOnly: true })} - ${formatINR(lead.budget_max)}`
    : lead.budget_max
    ? `Up to ${formatINR(lead.budget_max)}`
    : 'Budget open';

  const defaultWaText = `Namaste ${lead.name} ji! 🙏 Thank you for connecting. I have noted your requirement for ${lead.preferred_bhk.join('/') || 'property'} in ${lead.preferred_localities[0] || 'Mumbai'}. When is a good time for a quick 2-minute call today?`;

  return (
    <div className={`p-3.5 bg-white rounded-xl border transition-all hover:shadow-md ${
      isDueToday ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
    }`}>
      {/* Top row: Name, due badge & stage menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link href={`/leads/${lead.id}`} className="group flex-1">
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
            {lead.name}
            {isDueToday && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Due
              </span>
            )}
          </h4>
          <span className="text-[11px] text-slate-500">{formatPhoneDisplay(lead.phone)}</span>
        </Link>

        {/* Stage Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1 transition-colors"
          >
            <span>{lead.stage.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg border border-slate-200 shadow-xl z-20 py-1 text-xs">
              {STAGES.map(s => (
                <button
                  key={s.value}
                  onClick={() => {
                    updateLeadStage(lead.id, s.value);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-teal-50 flex items-center justify-between ${
                    lead.stage === s.value ? 'font-bold text-teal-800 bg-teal-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{s.label}</span>
                  {lead.stage === s.value && <CheckCircle2 className="w-3 h-3 text-teal-700" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Requirement tags */}
      <div className="space-y-1.5 mb-3">
        <div className="text-xs font-semibold text-teal-800 flex items-center gap-1">
          <span>{budgetDisplay}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {lead.preferred_bhk.map(b => (
            <span key={b} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
              {b}
            </span>
          ))}
          {lead.preferred_localities.slice(0, 2).map(loc => (
            <span key={loc} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
              {loc}
            </span>
          ))}
          {lead.preferred_localities.length > 2 && (
            <span className="text-[10px] text-slate-400">+{lead.preferred_localities.length - 2} more</span>
          )}
        </div>

        {matches.length > 0 && (
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{matches.length} matching {matches.length === 1 ? 'property' : 'properties'}</span>
          </div>
        )}
      </div>

      {/* Action Buttons: Phone & WhatsApp */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <a
          href={`tel:${lead.phone}`}
          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          title="Direct Call"
        >
          <Phone className="w-3.5 h-3.5 text-slate-600" />
          <span>Call</span>
        </a>

        <button
          onClick={() => onOpenWhatsApp ? onOpenWhatsApp(lead) : window.open(getWhatsAppUrl(lead.phone, defaultWaText), '_blank')}
          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          title="WhatsApp Chat"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
        </button>

        {onOpenScheduleVisit && (
          <button
            onClick={() => onOpenScheduleVisit(lead)}
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
            title="Schedule Visit"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
