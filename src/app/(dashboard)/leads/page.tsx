'use client';

import React, { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { AddLeadModal } from '@/components/crm/AddLeadModal';
import { WhatsAppShareModal } from '@/components/crm/WhatsAppShareModal';

export default function LeadsPage() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Header
        title="Leads CRM Pipeline"
        subtitle="Manage your buyer & tenant pipeline across stages with 1-tap WhatsApp"
        onOpenAddLead={() => setIsAddLeadOpen(true)}
        onOpenShareModal={() => setIsWaModalOpen(true)}
      />

      <div className="px-4 md:px-8">
        <KanbanBoard onOpenAddLead={() => setIsAddLeadOpen(true)} />
      </div>

      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
      />

      <WhatsAppShareModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
      />
    </div>
  );
}
