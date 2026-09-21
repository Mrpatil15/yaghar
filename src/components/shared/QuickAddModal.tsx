'use client';

import React from 'react';
import { X, UserPlus, Building2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddLead: () => void;
}

export function QuickAddModal({ isOpen, onClose, onOpenAddLead }: QuickAddModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900">Quick Action</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenAddLead();
            }}
            className="w-full p-3 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 flex items-center gap-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-teal-900">Log New Lead</div>
              <div className="text-[11px] text-slate-500">Capture buyer or tenant requirements</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              router.push('/properties/new');
            }}
            className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 flex items-center gap-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900">Add Property Listing</div>
              <div className="text-[11px] text-slate-500">Resale, rental, or developer project</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              router.push('/visits?action=schedule');
            }}
            className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 flex items-center gap-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-amber-900">Schedule Site Visit</div>
              <div className="text-[11px] text-slate-500">Book visit with property & lead</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
