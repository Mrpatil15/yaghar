'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/navigation/Header';
import { LeadStage } from '@/types/database.types';
import { formatINR, formatPhoneDisplay, formatDate, getWhatsAppUrl } from '@/lib/formatters';
import { 
  ArrowLeft, Phone, MessageSquare, Calendar, Sparkles, 
  Clock, Plus, CheckCircle2, Building2, Share2, Tag, Edit3 
} from 'lucide-react';
import Link from 'next/link';
import { WhatsAppShareModal } from '@/components/crm/WhatsAppShareModal';

const STAGES: { value: LeadStage; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'booked', label: 'Booked' },
  { value: 'lost', label: 'Lost' },
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id as string;
  const { leads, updateLead, updateLeadStage, getMatchingPropertiesForLead, workspace } = useApp();

  const [newNote, setNewNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [selectedPropertyForShare, setSelectedPropertyForShare] = useState<any>(null);

  const lead = leads.find(l => l.id === leadId);

  if (!lead) {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800">Lead not found</h2>
        <Link href="/leads" className="text-xs text-teal-700 font-semibold hover:underline">
          Return to Leads CRM
        </Link>
      </div>
    );
  }

  const matchingProperties = getMatchingPropertiesForLead(lead);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const existingNotes = lead.notes ? `${lead.notes}\n\n` : '';
    const noteEntry = `[${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}]: ${newNote.trim()}`;

    updateLead(lead.id, {
      notes: `${existingNotes}${noteEntry}`,
      last_contacted_at: new Date().toISOString(),
    });

    setNewNote('');
  };

  const handleUpdateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate) return;

    updateLead(lead.id, {
      next_follow_up_at: new Date(followUpDate).toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <Header
        title={lead.name}
        subtitle={`${lead.preferred_bhk.join('/') || 'Requirements'} • ${lead.source.toUpperCase()}`}
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leads CRM</span>
          </Link>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Client</span>
            </a>

            <button
              onClick={() => {
                setSelectedPropertyForShare(null);
                setIsWaModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Chat</span>
            </button>
          </div>
        </div>

        {/* Lead Overview Card & Stage Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{lead.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold capitalize">
                  {lead.source.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Phone: <span className="font-semibold text-slate-800">{formatPhoneDisplay(lead.phone)}</span>
                {lead.email && <span> • Email: {lead.email}</span>}
              </p>
            </div>

            {/* Stage Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Pipeline Stage:</span>
              <select
                value={lead.stage}
                onChange={e => updateLeadStage(lead.id, e.target.value as LeadStage)}
                className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg border border-slate-200 bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {STAGES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Budget Range</span>
              <span className="font-bold text-slate-900 text-sm">
                {lead.budget_min && lead.budget_max
                  ? `${formatINR(lead.budget_min, { showUnitOnly: true })} - ${formatINR(lead.budget_max)}`
                  : lead.budget_max
                  ? `Up to ${formatINR(lead.budget_max)}`
                  : 'Open'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Preferred BHK</span>
              <span className="font-bold text-slate-900 text-sm">
                {lead.preferred_bhk.join(', ') || 'Any'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Preferred Locality</span>
              <span className="font-bold text-slate-900 text-sm">
                {lead.preferred_localities.join(', ') || 'Mumbai Suburbs'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Next Follow-Up</span>
              <span suppressHydrationWarning className="font-bold text-slate-900 text-sm">
                {formatDate(lead.next_follow_up_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Lead-to-Property Matcher */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Lead-to-Property Matcher</h3>
                <p className="text-xs text-slate-500">Auto-suggests listings based on BHK, budget & locality</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              {matchingProperties.length} Matching Options
            </span>
          </div>

          {matchingProperties.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No properties in inventory currently match this lead's budget and BHK criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingProperties.map(({ property, score, reasons }) => (
                <div key={property.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{property.title}</h4>
                      <p className="text-xs text-slate-500">{property.locality} • {property.bhk}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      {score}% Match
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 text-sm">{formatINR(property.price)}</span>
                    <span className="text-slate-500">{property.carpet_area} sq.ft</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {reasons.map((r, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {r}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPropertyForShare(property);
                      setIsWaModalOpen(true);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Property on WhatsApp</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Timeline & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes & Activity Log */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Activity Timeline & Notes</span>
            </h3>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                placeholder="Log a call outcome, client feedback, or update..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Activity</span>
                </button>
              </div>
            </form>

            {/* Timeline entries */}
            <div className="space-y-3 pt-2">
              {lead.notes ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-line font-sans leading-relaxed">
                  {lead.notes}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  No activity notes logged yet. Use the box above to log calls or notes.
                </p>
              )}
            </div>
          </div>

          {/* Follow-up Scheduler */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>Follow-up Scheduler</span>
            </h3>

            <form onSubmit={handleUpdateFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">
                  Schedule Next Follow-Up:
                </label>
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={!followUpDate}
                className="w-full py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold transition-colors"
              >
                Set Follow-Up Reminder
              </button>
            </form>

            {lead.next_follow_up_at && (
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Next Reminder:</span>
                </div>
                <div>{formatDate(lead.next_follow_up_at)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {isWaModalOpen && (
        <WhatsAppShareModal
          isOpen={isWaModalOpen}
          initialLead={lead}
          initialProperty={selectedPropertyForShare}
          onClose={() => setIsWaModalOpen(false)}
        />
      )}
    </div>
  );
}
