'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Lead } from '@/types/database.types';
import { formatINR, formatPhoneDisplay, getWhatsAppUrl } from '@/lib/formatters';
import { MessageSquare, RefreshCw, AlertTriangle, Calendar } from 'lucide-react';

interface ReactivateDeadLeadsProps {
  onOpenWhatsApp: (lead: Lead) => void;
}

export function ReactivateDeadLeads({ onOpenWhatsApp }: ReactivateDeadLeadsProps) {
  const { leads, reactivateLead } = useApp();

  const deadLeads = leads.filter(l => l.is_dead || l.stage === 'lost');

  const getDaysInactive = (dateStr?: string | null) => {
    if (!dateStr) return 30;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h2 className="text-base font-bold text-slate-900">Reactivate Dead Leads Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            40% of real estate deals in India close after 3+ months. Reach out to inactive buyers with fresh inventory and festive discounts.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          {deadLeads.length} Inactive {deadLeads.length === 1 ? 'Lead' : 'Leads'}
        </span>
      </div>

      {deadLeads.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs border border-dashed rounded-xl">
          No dead or lost leads right now! All your leads are active.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {deadLeads.map(lead => {
            const daysInactive = getDaysInactive(lead.last_contacted_at || lead.created_at);
            const locality = lead.preferred_localities[0] || 'your area';

            const defaultReactivateText = `Namaste ${lead.name} ji! 🙏 A couple of new premium listings just opened up in ${locality} with special developer festive pricing. Are you still actively exploring properties in this area? Would love to share the brochures if you are available.`;

            return (
              <div key={lead.id} className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 hover:bg-white hover:shadow-md transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{lead.name}</h4>
                    <p className="text-xs text-slate-500">{formatPhoneDisplay(lead.phone)}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {daysInactive}d inactive
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requirement:</span>
                    <span className="font-semibold text-slate-800">{lead.preferred_bhk.join('/') || 'Any BHK'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Locality:</span>
                    <span className="font-semibold text-slate-800">{lead.preferred_localities.join(', ') || 'Mumbai'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget:</span>
                    <span className="font-semibold text-slate-800">
                      {lead.budget_max ? formatINR(lead.budget_max) : 'Open'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onOpenWhatsApp(lead)}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Pitch</span>
                  </button>

                  <button
                    onClick={() => reactivateLead(lead.id)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Move back to Contacted stage"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
