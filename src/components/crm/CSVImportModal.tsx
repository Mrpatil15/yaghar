'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { normalizeIndianPhone } from '@/lib/formatters';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
  const { importLeadsFromCSV, leads } = useApp();
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Array<any>>([]);
  const [previewStats, setPreviewStats] = useState<{ total: number; duplicates: number } | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const processCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return;

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = header.findIndex(h => h.includes('name'));
    const phoneIdx = header.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
    const emailIdx = header.findIndex(h => h.includes('email'));
    const bhkIdx = header.findIndex(h => h.includes('bhk') || h.includes('config'));
    const localityIdx = header.findIndex(h => h.includes('locality') || h.includes('area') || h.includes('city'));
    const sourceIdx = header.findIndex(h => h.includes('source'));

    const rows: any[] = [];
    let dups = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const name = nameIdx !== -1 ? cols[nameIdx] : cols[0];
      const phone = phoneIdx !== -1 ? cols[phoneIdx] : cols[1];
      const email = emailIdx !== -1 ? cols[emailIdx] : cols[2];
      const bhk = bhkIdx !== -1 ? cols[bhkIdx] : '2 BHK';
      const locality = localityIdx !== -1 ? cols[localityIdx] : 'Mumbai';
      const source = sourceIdx !== -1 ? cols[sourceIdx] : 'CSV Import';

      if (name && phone) {
        const norm = normalizeIndianPhone(phone);
        const isDup = leads.some(l => normalizeIndianPhone(l.phone) === norm) ||
                      rows.some(r => normalizeIndianPhone(r.phone) === norm);
        if (isDup) dups++;

        rows.push({ name, phone, email, bhk, locality, source, isDup });
      }
    }

    setParsedRows(rows);
    setPreviewStats({ total: rows.length, duplicates: dups });
  };

  const handleImport = () => {
    const res = importLeadsFromCSV(parsedRows.map(r => ({
      name: r.name,
      phone: r.phone,
      email: r.email,
      bhk: r.bhk,
      locality: r.locality,
      source: r.source,
    })));

    setResultMessage(`Successfully imported ${res.imported} new leads! (${res.duplicates} duplicates skipped)`);
    setTimeout(() => {
      setResultMessage(null);
      setParsedRows([]);
      setPreviewStats(null);
      setCsvText('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Import Leads from CSV</h2>
            <p className="text-xs text-slate-500">Bulk upload leads from 99acres, MagicBricks, or Excel</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {resultMessage ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <span className="font-semibold text-sm">{resultMessage}</span>
            </div>
          ) : (
            <>
              {/* File upload dropzone */}
              <label className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 transition-all text-center">
                <Upload className="w-8 h-8 text-teal-600 mb-2" />
                <span className="font-bold text-slate-800 text-sm">Choose CSV File</span>
                <span className="text-slate-400 text-[11px] mt-1">Columns: Name, Phone, Email, BHK, Locality, Source</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Paste CSV directly */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Or Paste CSV / Comma Separated Text:
                </label>
                <textarea
                  rows={4}
                  placeholder="Name, Phone, Locality, BHK&#10;Karan Mehta, 9820011223, Andheri West, 2 BHK&#10;Pooja Shah, 9821122334, Kandivali East, 1 BHK"
                  value={csvText}
                  onChange={e => {
                    setCsvText(e.target.value);
                    processCSV(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Preview Table */}
              {previewStats && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Preview ({parsedRows.length} rows detected):</span>
                    <span className="text-amber-700">
                      {previewStats.duplicates} duplicate numbers will be skipped
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Phone</th>
                          <th className="p-2">BHK</th>
                          <th className="p-2">Locality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.slice(0, 5).map((r, idx) => (
                          <tr key={idx} className={r.isDup ? 'bg-amber-50/50 text-amber-900' : ''}>
                            <td className="p-2 font-medium">{r.name}</td>
                            <td className="p-2">{r.phone}</td>
                            <td className="p-2">{r.bhk}</td>
                            <td className="p-2">{r.locality}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!resultMessage && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={parsedRows.length === 0}
              onClick={handleImport}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg shadow-sm shadow-teal-700/20"
            >
              Import {parsedRows.length > 0 ? `${parsedRows.length} Leads` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
