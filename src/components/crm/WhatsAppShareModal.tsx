'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Lead, Property, Template } from '@/types/database.types';
import { formatINR, formatPhoneDisplay, getWhatsAppUrl, replaceTemplateVariables } from '@/lib/formatters';
import { X, MessageSquare, Copy, ExternalLink, Check, Sparkles } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: Lead | null;
  initialProperty?: Property | null;
}

export function WhatsAppShareModal({
  isOpen,
  onClose,
  initialLead,
  initialProperty,
}: WhatsAppShareModalProps) {
  const { leads, properties, templates, workspace } = useApp();

  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead?.id || leads[0]?.id || '');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialProperty?.id || properties[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Update selection if props change
  useEffect(() => {
    if (initialLead) setSelectedLeadId(initialLead.id);
    if (initialProperty) setSelectedPropertyId(initialProperty.id);
  }, [initialLead, initialProperty]);

  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Recompute generated text when selections change
  useEffect(() => {
    if (!selectedTemplate) return;

    const leadName = selectedLead?.name || 'Sir / Ma’am';
    const propertyTitle = selectedProperty?.title || 'Featured Property';
    const locality = selectedProperty?.locality || selectedLead?.preferred_localities[0] || 'Mumbai';
    const priceFormatted = selectedProperty ? formatINR(selectedProperty.price) : 'Best Market Price';
    const carpetArea = selectedProperty?.carpet_area ? `${selectedProperty.carpet_area}` : '750';
    const bhk = selectedProperty?.bhk || selectedLead?.preferred_bhk[0] || '2 BHK';
    const micrositeLink = `https://yaghar.in/c/${workspace.slug}`;
    const locationPin = selectedProperty?.location_pin_url || 'https://maps.google.com';

    const text = replaceTemplateVariables(selectedTemplate.content, {
      lead_name: leadName,
      consultant_name: workspace.name,
      consultant_phone: workspace.phone || '+91 98201 23456',
      property_title: propertyTitle,
      locality,
      price_formatted: priceFormatted,
      carpet_area: carpetArea,
      bhk,
      microsite_link: micrositeLink,
      location_pin: locationPin,
      visit_time: 'Tomorrow at 11:30 AM',
    });

    setCustomMessage(text);
  }, [selectedTemplate, selectedLead, selectedProperty, workspace]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phone = selectedLead?.phone || '+919820123456';
    const url = getWhatsAppUrl(phone, customMessage);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">WhatsApp Deep-Link Share</h2>
              <p className="text-xs text-slate-500">1-tap personalized templates with live variables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Pick Lead */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recipient Lead:
            </label>
            <select
              value={selectedLeadId}
              onChange={e => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({formatPhoneDisplay(lead.phone)}) — {lead.stage.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Pick Template */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Message Template:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map(tpl => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    selectedTemplateId === tpl.id
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate">{tpl.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{tpl.category.replace('_', ' ')}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pick Property (if template mentions property) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Attached Property (for brochure & price):
            </label>
            <select
              value={selectedPropertyId}
              onChange={e => setSelectedPropertyId(e.target.value)}
              className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.locality}) — {formatINR(p.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Editable Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Message Preview (Editable):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-sans text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-[11px] text-slate-500 truncate">
            Target: <span className="font-semibold text-slate-800">{selectedLead?.name}</span> ({selectedLead?.phone})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
