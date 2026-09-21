'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, AlertCircle, Phone, IndianRupee, MapPin } from 'lucide-react';
import { LeadSource } from '@/types/database.types';
import { normalizeIndianPhone } from '@/lib/formatters';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'manual', label: 'Direct / Walk-in' },
  { value: '99acres', label: '99acres' },
  { value: 'magicbricks', label: 'MagicBricks' },
  { value: 'housing', label: 'Housing.com' },
  { value: 'meta_ads', label: 'Meta (FB/IG) Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'referral', label: 'Client Referral' },
  { value: 'microsite', label: 'My Microsite' },
];

const BHK_OPTIONS = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Commercial'];

export function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const { addLead, checkDuplicatePhone } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('manual');
  const [budgetMinLakh, setBudgetMinLakh] = useState('');
  const [budgetMaxLakh, setBudgetMaxLakh] = useState('');
  const [selectedBhk, setSelectedBhk] = useState<string[]>(['2 BHK']);
  const [locality, setLocality] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const duplicate = phone.length >= 10 ? checkDuplicatePhone(phone) : undefined;

  const toggleBhk = (bhk: string) => {
    setSelectedBhk(prev => 
      prev.includes(bhk) ? prev.filter(b => b !== bhk) : [...prev, bhk]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter lead name');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    const minBudget = budgetMinLakh ? parseFloat(budgetMinLakh) * 100000 : null;
    const maxBudget = budgetMaxLakh ? parseFloat(budgetMaxLakh) * 100000 : null;

    const res = addLead({
      name: name.trim(),
      phone: normalizeIndianPhone(phone),
      email: email.trim() || null,
      stage: 'new',
      source,
      budget_min: minBudget,
      budget_max: maxBudget,
      preferred_bhk: selectedBhk,
      preferred_localities: locality ? locality.split(',').map(s => s.trim()).filter(Boolean) : [],
      property_type: 'residential_buy',
      tags: [source],
      notes: notes.trim() || null,
    });

    if (!res.success) {
      setError(res.error || 'Failed to add lead');
      return;
    }

    // Reset & close
    setName('');
    setPhone('');
    setEmail('');
    setBudgetMinLakh('');
    setBudgetMaxLakh('');
    setLocality('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Log New Lead</h2>
            <p className="text-xs text-slate-500">Add client details and property requirements</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {duplicate && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong>Duplicate Warning:</strong> Lead with this phone already exists: <em>{duplicate.name}</em> ({duplicate.stage.toUpperCase()})
              </div>
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone (+91) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-medium text-slate-400">+91</span>
                <input
                  type="tel"
                  required
                  placeholder="98201 23456"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-11 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Email & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Source
              </label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as LeadSource)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BHK Config Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred BHK
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BHK_OPTIONS.map(bhk => {
                const isSelected = selectedBhk.includes(bhk);
                return (
                  <button
                    type="button"
                    key={bhk}
                    onClick={() => toggleBhk(bhk)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bhk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget in Lakhs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Budget (₹ Lakhs)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="50 (for 50L)"
                  value={budgetMinLakh}
                  onChange={e => setBudgetMinLakh(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Budget (₹ Lakhs)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="120 (for 1.2 Cr)"
                  value={budgetMaxLakh}
                  onChange={e => setBudgetMaxLakh(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Locality */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Localities (comma separated)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Borivali East, Kandivali, Malad"
                value={locality}
                onChange={e => setLocality(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client Requirements & Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Ready to move, needs good connectivity to Metro, pre-approved home loan with HDFC."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm shadow-teal-700/20 transition-all active:scale-95"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
