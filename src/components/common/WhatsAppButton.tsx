'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_CHAT_URL, SUPPORT_WHATSAPP_DISPLAY } from '@/config/site';

export function WhatsAppButton() {
  return (
    <aside aria-label="WhatsApp Support">
      <a
        href={WHATSAPP_CHAT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp at +91 79771 32923"
        className="fixed bottom-6 right-4 sm:right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xl shadow-emerald-950/25 hover:shadow-emerald-950/35 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-3 focus:ring-emerald-500/50"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline font-semibold tracking-wide">
          Chat on WhatsApp
        </span>
        <span className="sm:hidden font-semibold">
          WhatsApp
        </span>
      </a>
    </aside>
  );
}
