'use client';

import React, { useState } from 'react';
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { AddLeadModal } from '@/components/crm/AddLeadModal';
import { QuickAddModal } from '@/components/shared/QuickAddModal';
import { WhatsAppShareModal } from '@/components/crm/WhatsAppShareModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <main className="flex-1 pb-16 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Modals */}
      <AddLeadModal 
        isOpen={isAddLeadOpen} 
        onClose={() => setIsAddLeadOpen(false)} 
      />
      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)}
        onOpenAddLead={() => setIsAddLeadOpen(true)}
      />
      <WhatsAppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
