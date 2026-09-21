'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { SiteVisit } from '@/types/database.types';
import { formatDateTime, formatDate, formatPhoneDisplay, getWhatsAppUrl } from '@/lib/formatters';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Building2, 
  CheckCircle2, XCircle, AlertCircle, Plus, MessageSquare, Star, X 
} from 'lucide-react';

export default function SiteVisitsPage() {
  const { visits, leads, properties, scheduleVisit, updateVisit, updateLeadStage, workspace } = useApp();

  // Schedule modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  const [selectedPropId, setSelectedPropId] = useState(properties[0]?.id || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  // Outcome modal
  const [outcomeModalVisit, setOutcomeModalVisit] = useState<SiteVisit | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<'completed' | 'cancelled' | 'no_show'>('completed');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [rating, setRating] = useState(4);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !selectedPropId || !scheduledAt) return;

    scheduleVisit({
      lead_id: selectedLeadId,
      property_id: selectedPropId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      status: 'scheduled',
      outcome_notes: notes.trim() || null,
    });

    setIsScheduleOpen(false);
    setScheduledAt('');
    setNotes('');
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeModalVisit) return;

    updateVisit(outcomeModalVisit.id, {
      status: outcomeStatus,
      outcome_notes: outcomeNotes.trim() || null,
      feedback_rating: rating,
    });

    // Update lead stage
    if (outcomeStatus === 'completed') {
      updateLeadStage(outcomeModalVisit.lead_id, 'negotiation');
    } else if (outcomeStatus === 'cancelled' || outcomeStatus === 'no_show') {
      // Keep as contacted
    }

    setOutcomeModalVisit(null);
    setOutcomeNotes('');
  };

  const getLead = (id: string) => leads.find(l => l.id === id);
  const getProp = (id: string) => properties.find(p => p.id === id);

  return (
    <div className="space-y-6">
      <Header
        title="Site Visit Scheduler"
        subtitle="Manage scheduled property tours, outcomes, and WhatsApp reminders"
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        {/* Top actions bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-600">
            {visits.filter(v => v.status === 'scheduled').length} upcoming visits scheduled
          </div>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule New Visit</span>
          </button>
        </div>

        {/* Visits List */}
        <div className="space-y-3">
          {visits.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">No site visits scheduled</h3>
              <p className="text-xs text-slate-400">Click the button above to schedule a visit with a client.</p>
            </div>
          ) : (
            visits.map(visit => {
              const lead = getLead(visit.lead_id);
              const prop = getProp(visit.property_id);
              const isPast = new Date(visit.scheduled_at) < new Date();

              const waReminderText = `Namaste ${lead?.name || 'Client'} ji! 🙏 Reminder for our scheduled site visit for *${prop?.title || 'property'}* today at *${formatDateTime(visit.scheduled_at)}*. Location: ${prop?.location_pin_url || 'https://maps.google.com'}. Please call me if you need directions: ${workspace.phone || ''}.`;

              return (
                <div
                  key={visit.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex flex-col items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{lead?.name || 'Client'}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          visit.status === 'scheduled'
                            ? 'bg-amber-100 text-amber-800'
                            : visit.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {visit.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prop?.title || 'Property'} ({prop?.locality})</span>
                      </div>

                      <div className="text-xs text-teal-800 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{formatDateTime(visit.scheduled_at)}</span>
                      </div>

                      {visit.outcome_notes && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1">
                          "{visit.outcome_notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <a
                      href={getWhatsAppUrl(lead?.phone || '+919820123456', waReminderText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Pin</span>
                    </a>

                    {visit.status === 'scheduled' && (
                      <button
                        onClick={() => setOutcomeModalVisit(visit)}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs"
                      >
                        Log Outcome
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Schedule Visit Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Schedule Site Visit</h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Lead / Client</label>
                <select
                  value={selectedLeadId}
                  onChange={e => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({formatPhoneDisplay(l.phone)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Property to Visit</label>
                <select
                  value={selectedPropId}
                  onChange={e => setSelectedPropId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.locality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visit Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Meeting point / instructions)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Meet at building entrance lobby. Bring brochure."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl shadow-xs"
                >
                  Confirm Site Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outcome Modal */}
      {outcomeModalVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Log Site Visit Outcome</h3>
              <button
                onClick={() => setOutcomeModalVisit(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveOutcome} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visit Result</label>
                <select
                  value={outcomeStatus}
                  onChange={e => setOutcomeStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="completed">Completed (Client Liked Property)</option>
                  <option value="no_show">Client Did Not Show Up (No-Show)</option>
                  <option value="cancelled">Cancelled by Client / Owner</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Interest Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl border ${
                        rating >= star ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Outcome & Feedback Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Client loved the master bedroom and view. Price negotiation requested from builder. Offer expected tomorrow."
                  value={outcomeNotes}
                  onChange={e => setOutcomeNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <p className="text-[11px] text-teal-700 bg-teal-50 p-2 rounded-lg">
                <strong>Next Step:</strong> Marking as completed will automatically advance the lead to <em>Negotiation</em> stage in your CRM.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOutcomeModalVisit(null)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
