'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Lead, LeadStage } from '@/types/database.types';
import { LeadCard } from './LeadCard';
import { Search, Filter, Plus, Upload, UserX, Clock, Sparkles } from 'lucide-react';
import { CSVImportModal } from './CSVImportModal';
import { ReactivateDeadLeads } from './ReactivateDeadLeads';
import { WhatsAppShareModal } from './WhatsAppShareModal';

const COLUMNS: { stage: LeadStage; title: string; color: string; bgLight: string }[] = [
  { stage: 'new', title: 'New Leads', color: 'border-blue-500 text-blue-700', bgLight: 'bg-blue-50/50' },
  { stage: 'contacted', title: 'Contacted', color: 'border-purple-500 text-purple-700', bgLight: 'bg-purple-50/50' },
  { stage: 'site_visit', title: 'Site Visit', color: 'border-amber-500 text-amber-700', bgLight: 'bg-amber-50/50' },
  { stage: 'negotiation', title: 'Negotiation', color: 'border-orange-500 text-orange-700', bgLight: 'bg-orange-50/50' },
  { stage: 'booked', title: 'Booked / Won', color: 'border-emerald-500 text-emerald-700', bgLight: 'bg-emerald-50/50' },
  { stage: 'lost', title: 'Lost / Inactive', color: 'border-slate-400 text-slate-700', bgLight: 'bg-slate-50/50' },
];

export function KanbanBoard({ onOpenAddLead }: { onOpenAddLead: () => void }) {
  const { leads, updateLeadStage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'due_today' | 'dead'>('all');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedLeadForWa, setSelectedLeadForWa] = useState<Lead | null>(null);

  // Filter leads based on search & filter tabs
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.preferred_localities.some(loc => loc.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Filter tabs
      if (activeFilter === 'due_today') {
        if (!lead.next_follow_up_at || lead.is_dead) return false;
        return new Date(lead.next_follow_up_at) <= new Date();
      }

      if (activeFilter === 'dead') {
        return lead.is_dead || lead.stage === 'lost';
      }

      return true;
    });
  }, [leads, searchQuery, activeFilter]);

  const dueCount = useMemo(() => {
    return leads.filter(l => l.next_follow_up_at && new Date(l.next_follow_up_at) <= new Date() && !l.is_dead).length;
  }, [leads]);

  const deadCount = useMemo(() => {
    return leads.filter(l => l.is_dead || l.stage === 'lost').length;
  }, [leads]);

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone, or locality..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({leads.length})
          </button>

          <button
            onClick={() => setActiveFilter('due_today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeFilter === 'due_today'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Due Today ({dueCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('dead')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeFilter === 'dead'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Reactivate Dead ({deadCount})</span>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV Import</span>
          </button>

          <button
            onClick={onOpenAddLead}
            className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* If "Reactivate Dead" tab is active, show the dedicated reactivation component */}
      {activeFilter === 'dead' ? (
        <ReactivateDeadLeads onOpenWhatsApp={lead => setSelectedLeadForWa(lead)} />
      ) : (
        /* Kanban Columns Container */
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[600px] snap-x">
          {COLUMNS.map(col => {
            const colLeads = filteredLeads.filter(l => l.stage === col.stage);
            return (
              <div
                key={col.stage}
                className="w-72 sm:w-80 flex-shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[calc(100vh-220px)] snap-start"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.color.split(' ')[0]}`} />
                    <h3 className="font-bold text-xs md:text-sm text-slate-900">{col.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 text-[11px] font-bold border border-slate-200">
                    {colLeads.length}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {colLeads.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onOpenWhatsApp={l => setSelectedLeadForWa(l)}
                    />
                  ))}

                  {colLeads.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />

      {/* WhatsApp Share Modal */}
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
