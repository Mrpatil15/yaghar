'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { 
  FolderCheck, FileText, CheckCircle2, Circle, 
  Upload, ShieldCheck, Download, Plus, X 
} from 'lucide-react';

export default function DocumentsPage() {
  const { checklists, updateChecklist } = useApp();
  const [activeCategory, setActiveCategory] = useState<'buy' | 'sell' | 'rent'>('buy');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocType, setUploadDocType] = useState('index_2');

  const currentChecklist = checklists.find(c => c.category === activeCategory) || checklists[0];

  const completedCount = currentChecklist?.items.filter(i => i.checked).length || 0;
  const totalCount = currentChecklist?.items.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <Header
        title="Document Vault & Checklists"
        subtitle="Indian property transaction compliance checklists (Index II, Society NOC, 7/12, OC)"
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        {/* Category switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'buy', label: 'Resale Flat Purchase' },
              { id: 'rent', label: 'Rental Agreement & Police NOC' },
              { id: 'sell', label: 'Seller Document Docket' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">{currentChecklist?.title}</h3>
              <p className="text-xs text-slate-500">Legal verification progress for clean title transfer</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-teal-800">{progressPct}%</span>
              <span className="text-xs text-slate-400 block">{completedCount} of {totalCount} verified</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {currentChecklist?.items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => updateChecklist(currentChecklist.id, idx, !item.checked)}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'border-2 border-slate-300 text-transparent group-hover:border-teal-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div>
                  <span className={`text-xs sm:text-sm font-semibold transition-colors ${
                    item.checked ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}>
                    {item.name}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.name.includes('Index II') && 'Original registration receipt from sub-registrar office'}
                    {item.name.includes('7/12') && 'Land title revenue record'}
                    {item.name.includes('OC') && 'Occupancy Certificate issued by local municipal corporation'}
                    {item.name.includes('KYC') && 'PAN Card + Aadhaar verification'}
                    {item.name.includes('Society') && 'No dues and transfer NOC from housing society'}
                    {item.name.includes('Title Search') && '30 years title search report by advocate'}
                    {item.name.includes('Tax') && 'Up to date property tax receipt'}
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                item.checked
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {item.checked ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Upload to Document Vault</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Name</label>
                <input
                  type="text"
                  placeholder="e.g. Index II - Flat 402 Oberoi Sky City"
                  value={uploadDocName}
                  onChange={e => setUploadDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                <select
                  value={uploadDocType}
                  onChange={e => setUploadDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="index_2">Index II (Sub-Registrar Receipt)</option>
                  <option value="7_12">7/12 Extract</option>
                  <option value="allotment_letter">Allotment Letter / Agreement</option>
                  <option value="society_noc">Society NOC & Share Certificate</option>
                  <option value="pan_aadhaar">Buyer / Seller KYC</option>
                  <option value="oc">Occupancy Certificate (OC)</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50">
                <Upload className="w-6 h-6 text-teal-600 mx-auto mb-1.5" />
                <span className="font-bold text-slate-700">Choose PDF / Image</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Encrypted and stored with multi-tenant access control</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadDocName('');
                  }}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save to Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
