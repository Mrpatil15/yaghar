'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { PropertyCard } from '@/components/inventory/PropertyCard';
import { PropertyFilters } from '@/components/inventory/PropertyFilters';
import { Property, Lead } from '@/types/database.types';
import { formatINR } from '@/lib/formatters';
import { Plus, Building2, Layers, KeyRound, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { WhatsAppShareModal } from '@/components/crm/WhatsAppShareModal';

export default function PropertiesPage() {
  const { properties, leads } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('All');
  const [maxBudgetLakh, setMaxBudgetLakh] = useState('');

  const [selectedPropertyForWa, setSelectedPropertyForWa] = useState<Property | null>(null);
  const [matchingModalProp, setMatchingModalProp] = useState<Property | null>(null);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        prop.title.toLowerCase().includes(q) ||
        prop.locality.toLowerCase().includes(q) ||
        (prop.rera_number && prop.rera_number.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Type
      if (selectedType !== 'all' && prop.listing_type !== selectedType) {
        return false;
      }

      // BHK
      if (selectedBhk !== 'All' && !prop.bhk.includes(selectedBhk)) {
        return false;
      }

      // Max budget
      if (maxBudgetLakh) {
        const maxINR = parseFloat(maxBudgetLakh) * 100000;
        if (prop.price > maxINR) return false;
      }

      return true;
    });
  }, [properties, searchQuery, selectedType, selectedBhk, maxBudgetLakh]);

  // Inventory value
  const totalInventoryValue = useMemo(() => {
    return properties.reduce((acc, p) => acc + p.price, 0);
  }, [properties]);

  const readyCount = properties.filter(p => p.possession_status === 'ready_to_move').length;
  const underConstCount = properties.filter(p => p.possession_status === 'under_construction').length;

  // Matching leads for modal
  const modalMatchingLeads = useMemo(() => {
    if (!matchingModalProp) return [];
    return leads.filter(l => {
      if (l.is_dead) return false;
      const bhkMatch = l.preferred_bhk.length === 0 || l.preferred_bhk.some(b => matchingModalProp.bhk.includes(b) || b.includes(matchingModalProp.bhk));
      const budgetMatch = !l.budget_max || matchingModalProp.price <= l.budget_max * 1.15;
      return bhkMatch && budgetMatch;
    });
  }, [matchingModalProp, leads]);

  return (
    <div className="space-y-6">
      <Header
        title="Property Inventory"
        subtitle="Manage resale, new projects, and rental listings with RERA details"
      />

      <div className="px-4 md:px-8 space-y-5">
        {/* KPI Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Listings</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{properties.length}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</div>
            <div className="text-xl font-black text-teal-700 mt-0.5">{formatINR(totalInventoryValue)}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ready to Move</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{readyCount}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Under Construction</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{underConstCount}</div>
          </div>
        </div>

        {/* Filters */}
        <PropertyFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedBhk={selectedBhk}
          onBhkChange={setSelectedBhk}
          maxBudgetLakh={maxBudgetLakh}
          onMaxBudgetChange={setMaxBudgetLakh}
          onReset={() => {
            setSearchQuery('');
            setSelectedType('all');
            setSelectedBhk('All');
            setMaxBudgetLakh('');
          }}
        />

        {/* Action button on top of grid */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-600">
            Showing <span className="font-bold text-slate-900">{filteredProperties.length}</span> of {properties.length} properties
          </div>
          <Link
            href="/properties/new"
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Property</span>
          </Link>
        </div>

        {/* Grid */}
        {filteredProperties.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700">No properties found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or add a new property listing to your inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onOpenWhatsApp={p => setSelectedPropertyForWa(p)}
                onShowMatchingLeads={p => setMatchingModalProp(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Share Modal */}
      {selectedPropertyForWa && (
        <WhatsAppShareModal
          isOpen={!!selectedPropertyForWa}
          initialProperty={selectedPropertyForWa}
          onClose={() => setSelectedPropertyForWa(null)}
        />
      )}

      {/* Matching Leads Modal */}
      {matchingModalProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Matching Buyers for:</h3>
                <p className="text-xs text-teal-700 font-semibold">{matchingModalProp.title}</p>
              </div>
              <button
                onClick={() => setMatchingModalProp(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {modalMatchingLeads.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active buyers in your CRM currently match this property configuration and budget.
                </div>
              ) : (
                modalMatchingLeads.map(lead => (
                  <div key={lead.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Budget: {lead.budget_max ? formatINR(lead.budget_max) : 'Open'} • {lead.preferred_bhk.join('/')}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const targetLead = lead;
                        const targetProp = matchingModalProp;
                        setMatchingModalProp(null);
                        setSelectedPropertyForWa(targetProp);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Share Option</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
