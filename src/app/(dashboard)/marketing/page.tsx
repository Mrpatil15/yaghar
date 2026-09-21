'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { useApp } from '@/context/AppContext';
import { Property } from '@/types/database.types';
import { formatINR, formatPhoneDisplay } from '@/lib/formatters';
import { 
  Megaphone, Sparkles, Copy, Check, Download, 
  Printer, Building2, Video, Share2, ShieldCheck, RefreshCw 
} from 'lucide-react';

export default function MarketingPage() {
  const { properties, workspace } = useApp();

  const [activeTab, setActiveTab] = useState<'flyer' | 'captions' | 'scripts'>('flyer');
  const [selectedPropId, setSelectedPropId] = useState<string>(properties[0]?.id || '');
  const [copied, setCopied] = useState(false);

  // AI Caption state
  const [captionTone, setCaptionTone] = useState<'professional' | 'festive' | 'urgent'>('professional');
  const [aiCaption, setAiCaption] = useState<string>('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // Reel Script state
  const [reelScript, setReelScript] = useState<string>('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const selectedProperty = properties.find(p => p.id === selectedPropId) || properties[0];

  const handleGenerateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_caption',
          property: selectedProperty,
          tone: captionTone,
        }),
      });
      const data = await res.json();
      setAiCaption(data.result || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reel_script',
          property: selectedProperty,
        }),
      });
      const data = await res.json();
      setReelScript(data.result || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Marketing & Social Kit"
        subtitle="AI caption generator, branded flyers, and Instagram Reel scripts"
      />

      <div className="px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'flyer', label: 'Property Flyer Generator' },
            { id: 'captions', label: 'AI Instagram / WhatsApp Captions' },
            { id: 'scripts', label: '30-Sec Reel Script Templates' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Property Selector for all tabs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <label className="text-xs font-bold text-slate-800">Select Property to Promote:</label>
          </div>
          <select
            value={selectedPropId}
            onChange={e => setSelectedPropId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.locality}) — {formatINR(p.price)}
              </option>
            ))}
          </select>
        </div>

        {/* 1. PROPERTY FLYER GENERATOR */}
        {activeTab === 'flyer' && selectedProperty && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Flyer Preview Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-slate-900 overflow-hidden shadow-xl" id="printable-flyer">
              {/* Flyer Top Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base tracking-tight">{workspace.name}</h3>
                  <p className="text-[11px] text-teal-300">Verified RERA Real Estate Consultants</p>
                </div>
                {workspace.rera_number && (
                  <span className="text-[10px] font-mono font-bold bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
                    RERA: {workspace.rera_number}
                  </span>
                )}
              </div>

              {/* Flyer Image */}
              <div className="relative h-64 sm:h-80 w-full bg-slate-100">
                <img
                  src={selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80'}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-teal-800 text-white px-4 py-1.5 rounded-xl font-black text-lg shadow-lg">
                  {formatINR(selectedProperty.price)}
                </div>
                <div className="absolute top-4 right-4 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-lg uppercase">
                  {selectedProperty.bhk}
                </div>
              </div>

              {/* Flyer Details */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xl font-black text-slate-900">{selectedProperty.title}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    📍 {selectedProperty.locality}, {selectedProperty.city}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Carpet Area</span>
                    <span className="font-bold text-slate-800">{selectedProperty.carpet_area} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Configuration</span>
                    <span className="font-bold text-slate-800">{selectedProperty.bhk}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Possession</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedProperty.possession_status.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedProperty.amenities.slice(0, 5).map(a => (
                    <span key={a} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      ✓ {a}
                    </span>
                  ))}
                </div>

                {/* Consultant Callout Footer */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">For Site Visits & Booking:</span>
                    <span className="text-sm font-black text-teal-800">{formatPhoneDisplay(workspace.phone || '+91 98201 23456')}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                    Zero Brokerage / Direct Mandate
                  </span>
                </div>
              </div>
            </div>

            {/* Flyer Controls */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900">Flyer Actions</h4>
              <p className="text-xs text-slate-500">
                Share this clean social flyer on WhatsApp status, Instagram stories, or print for site visits.
              </p>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1">
                <strong>Pro-Tip:</strong> High-producing consultants print 50 copies of this flyer before every Saturday open-house or site visit!
              </div>
            </div>
          </div>
        )}

        {/* 2. AI CAPTIONS */}
        {activeTab === 'captions' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">AI Social Media Caption Generator</h3>
                <p className="text-xs text-slate-500">Generate high-converting Instagram, Facebook & WhatsApp status copies with hashtags</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={captionTone}
                  onChange={e => setCaptionTone(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="professional">Professional & Verified</option>
                  <option value="festive">Festive / Limited Period Offer</option>
                  <option value="urgent">Urgent / Price Drop Alert</option>
                </select>

                <button
                  onClick={handleGenerateCaption}
                  disabled={isGeneratingCaption}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  {isGeneratingCaption ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {aiCaption ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Generated Social Copy:</span>
                  <button
                    onClick={() => copyToClipboard(aiCaption)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Caption'}</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={aiCaption}
                  onChange={e => setAiCaption(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-sans text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                Click "Generate with AI" to write a tailored promotional caption for {selectedProperty?.title}.
              </div>
            )}
          </div>
        )}

        {/* 3. REEL SCRIPTS */}
        {activeTab === 'scripts' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">30-Second Property Reel Script</h3>
                <p className="text-xs text-slate-500">Fast-paced, hook-based video script formatted for Instagram Reels and YouTube Shorts</p>
              </div>

              <button
                onClick={handleGenerateScript}
                disabled={isGeneratingScript}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                {isGeneratingScript ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing Script...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" />
                    <span>Generate Reel Script</span>
                  </>
                )}
              </button>
            </div>

            {reelScript ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Script Timeline:</span>
                  <button
                    onClick={() => copyToClipboard(reelScript)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={reelScript}
                  onChange={e => setReelScript(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                Click "Generate Reel Script" to create a 30-second camera-ready tour script for {selectedProperty?.title}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
