'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Workspace, Lead, Property, Deal, SiteVisit, Checklist, Template, Microsite, LeadStage 
} from '@/types/database.types';
import { 
  INITIAL_WORKSPACE, INITIAL_PROPERTIES, INITIAL_LEADS, INITIAL_DEALS, 
  INITIAL_VISITS, INITIAL_CHECKLISTS, INITIAL_TEMPLATES, INITIAL_MICROSITE 
} from '@/lib/demo-data';
import { normalizeIndianPhone } from '@/lib/formatters';
import { PLANS, PlanConfig } from '@/lib/plans';

interface AppContextType {
  workspace: Workspace;
  setWorkspace: (ws: Workspace) => void;
  leads: Lead[];
  properties: Property[];
  deals: Deal[];
  visits: SiteVisit[];
  checklists: Checklist[];
  templates: Template[];
  microsite: Microsite;
  plan: PlanConfig;
  // Actions
  addLead: (lead: Omit<Lead, 'id' | 'workspace_id' | 'created_at' | 'updated_at' | 'is_dead'>) => { success: boolean; lead?: Lead; error?: string };
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  checkDuplicatePhone: (phone: string, excludeId?: string) => Lead | undefined;
  reactivateLead: (id: string) => void;
  importLeadsFromCSV: (csvRows: Array<{ name: string; phone: string; email?: string; budget?: string; bhk?: string; locality?: string; source?: string }>) => { imported: number; duplicates: number };
  addProperty: (property: Omit<Property, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>) => { success: boolean; property?: Property; error?: string };
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getMatchingPropertiesForLead: (lead: Lead) => Array<{ property: Property; score: number; reasons: string[] }>;
  scheduleVisit: (visit: Omit<SiteVisit, 'id' | 'workspace_id' | 'created_at'>) => void;
  updateVisit: (id: string, updates: Partial<SiteVisit>) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  updateChecklist: (checklistId: string, itemIndex: number, checked: boolean) => void;
  updateMicrosite: (updates: Partial<Microsite>) => void;
  loadDemoData: () => void;
  canAddLead: () => boolean;
  canAddProperty: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'yaghar_state_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace>(INITIAL_WORKSPACE);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [visits, setVisits] = useState<SiteVisit[]>(INITIAL_VISITS);
  const [checklists, setChecklists] = useState<Checklist[]>(INITIAL_CHECKLISTS);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [microsite, setMicrosite] = useState<Microsite>(INITIAL_MICROSITE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.workspace) setWorkspaceState(parsed.workspace);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.properties) setProperties(parsed.properties);
        if (parsed.deals) setDeals(parsed.deals);
        if (parsed.visits) setVisits(parsed.visits);
        if (parsed.checklists) setChecklists(parsed.checklists);
        if (parsed.templates) setTemplates(parsed.templates);
        if (parsed.microsite) setMicrosite(parsed.microsite);
      }
    } catch (e) {
      console.error('Failed to load stored state', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        workspace,
        leads,
        properties,
        deals,
        visits,
        checklists,
        templates,
        microsite,
      }));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [isLoaded, workspace, leads, properties, deals, visits, checklists, templates, microsite]);

  const plan = PLANS[workspace.plan_tier] || PLANS.trial;

  const canAddLead = useCallback(() => {
    return leads.length < plan.limits.maxLeads;
  }, [leads.length, plan.limits.maxLeads]);

  const canAddProperty = useCallback(() => {
    return properties.length < plan.limits.maxProperties;
  }, [properties.length, plan.limits.maxProperties]);

  const checkDuplicatePhone = useCallback((phone: string, excludeId?: string) => {
    const norm = normalizeIndianPhone(phone);
    return leads.find(l => l.id !== excludeId && normalizeIndianPhone(l.phone) === norm);
  }, [leads]);

  const addLead = useCallback((leadData: Omit<Lead, 'id' | 'workspace_id' | 'created_at' | 'updated_at' | 'is_dead'>) => {
    if (!canAddLead()) {
      return { success: false, error: `Plan limit of ${plan.limits.maxLeads} leads reached. Please upgrade.` };
    }
    const duplicate = checkDuplicatePhone(leadData.phone);
    if (duplicate) {
      return { success: false, error: `A lead with phone ${leadData.phone} already exists (${duplicate.name}).` };
    }

    const newLead: Lead = {
      ...leadData,
      id: 'lead-' + Date.now(),
      workspace_id: workspace.id,
      is_dead: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLeads(prev => [newLead, ...prev]);
    return { success: true, lead: newLead };
  }, [canAddLead, checkDuplicatePhone, plan.limits.maxLeads, workspace.id]);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateLeadStage = useCallback((id: string, stage: LeadStage) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      return {
        ...l,
        stage,
        is_dead: stage === 'lost',
        updated_at: new Date().toISOString(),
      };
    }));
  }, []);

  const reactivateLead = useCallback((id: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      return {
        ...l,
        stage: 'contacted',
        is_dead: false,
        dead_reason: undefined,
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }));
  }, []);

  const importLeadsFromCSV = useCallback((csvRows: Array<{ name: string; phone: string; email?: string; budget?: string; bhk?: string; locality?: string; source?: string }>) => {
    let imported = 0;
    let duplicates = 0;
    const newLeads: Lead[] = [];

    csvRows.forEach(row => {
      if (!row.name || !row.phone) return;
      const normPhone = normalizeIndianPhone(row.phone);
      const isDup = leads.some(l => normalizeIndianPhone(l.phone) === normPhone) || 
                    newLeads.some(l => normalizeIndianPhone(l.phone) === normPhone);
      
      if (isDup) {
        duplicates++;
        return;
      }

      newLeads.push({
        id: 'lead-csv-' + Math.random().toString(36).substr(2, 9),
        workspace_id: workspace.id,
        name: row.name,
        phone: row.phone,
        email: row.email || null,
        stage: 'new',
        source: (row.source as any) || 'manual',
        preferred_bhk: row.bhk ? [row.bhk] : [],
        preferred_localities: row.locality ? [row.locality] : [],
        property_type: 'residential_buy',
        tags: ['CSV Import'],
        is_dead: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      imported++;
    });

    if (newLeads.length > 0) {
      setLeads(prev => [...newLeads, ...prev]);
    }
    return { imported, duplicates };
  }, [leads, workspace.id]);

  const addProperty = useCallback((propData: Omit<Property, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>) => {
    if (!canAddProperty()) {
      return { success: false, error: `Plan limit of ${plan.limits.maxProperties} properties reached. Please upgrade.` };
    }

    const newProp: Property = {
      ...propData,
      id: 'prop-' + Date.now(),
      workspace_id: workspace.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProperties(prev => [newProp, ...prev]);
    return { success: true, property: newProp };
  }, [canAddProperty, plan.limits.maxProperties, workspace.id]);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  }, []);

  // Lead to Property Matching Algorithm
  const getMatchingPropertiesForLead = useCallback((lead: Lead) => {
    const matches: Array<{ property: Property; score: number; reasons: string[] }> = [];

    properties.forEach(prop => {
      let score = 0;
      const reasons: string[] = [];

      // BHK match (40 pts)
      if (lead.preferred_bhk && lead.preferred_bhk.length > 0) {
        if (lead.preferred_bhk.some(b => prop.bhk.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(prop.bhk.toLowerCase()))) {
          score += 40;
          reasons.push(`BHK matches (${prop.bhk})`);
        }
      } else {
        score += 20; // no specific BHK requirement
      }

      // Locality match (35 pts)
      if (lead.preferred_localities && lead.preferred_localities.length > 0) {
        const localityMatch = lead.preferred_localities.some(loc => 
          prop.locality.toLowerCase().includes(loc.toLowerCase()) || 
          loc.toLowerCase().includes(prop.locality.toLowerCase())
        );
        if (localityMatch) {
          score += 35;
          reasons.push(`Locality matches (${prop.locality})`);
        }
      }

      // Budget match (25 pts)
      const minBudget = lead.budget_min || 0;
      const maxBudget = lead.budget_max || Infinity;
      if (prop.price >= minBudget && prop.price <= maxBudget) {
        score += 25;
        reasons.push('Fits budget range');
      } else if (prop.price <= maxBudget * 1.1) {
        score += 15; // slightly flexible budget
        reasons.push('Within 10% of budget');
      }

      if (score >= 40) {
        matches.push({ property: prop, score, reasons });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  }, [properties]);

  const scheduleVisit = useCallback((visitData: Omit<SiteVisit, 'id' | 'workspace_id' | 'created_at'>) => {
    const newVisit: SiteVisit = {
      ...visitData,
      id: 'visit-' + Date.now(),
      workspace_id: workspace.id,
      created_at: new Date().toISOString(),
    };
    setVisits(prev => [newVisit, ...prev]);

    // Update lead stage if appropriate
    updateLeadStage(visitData.lead_id, 'site_visit');
  }, [updateLeadStage, workspace.id]);

  const updateVisit = useCallback((id: string, updates: Partial<SiteVisit>) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const addDeal = useCallback((dealData: Omit<Deal, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: 'deal-' + Date.now(),
      workspace_id: workspace.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDeals(prev => [newDeal, ...prev]);
    updateLeadStage(dealData.lead_id, 'booked');
  }, [updateLeadStage, workspace.id]);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d));
  }, []);

  const updateChecklist = useCallback((checklistId: string, itemIndex: number, checked: boolean) => {
    setChecklists(prev => prev.map(chk => {
      if (chk.id !== checklistId) return chk;
      const newItems = [...chk.items];
      if (newItems[itemIndex]) {
        newItems[itemIndex] = { ...newItems[itemIndex], checked };
      }
      return { ...chk, items: newItems };
    }));
  }, []);

  const updateMicrosite = useCallback((updates: Partial<Microsite>) => {
    setMicrosite(prev => ({ ...prev, ...updates }));
  }, []);

  const loadDemoData = useCallback(() => {
    setWorkspaceState(INITIAL_WORKSPACE);
    setLeads(INITIAL_LEADS);
    setProperties(INITIAL_PROPERTIES);
    setDeals(INITIAL_DEALS);
    setVisits(INITIAL_VISITS);
    setChecklists(INITIAL_CHECKLISTS);
    setTemplates(INITIAL_TEMPLATES);
    setMicrosite(INITIAL_MICROSITE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        workspace: INITIAL_WORKSPACE,
        leads: INITIAL_LEADS,
        properties: INITIAL_PROPERTIES,
        deals: INITIAL_DEALS,
        visits: INITIAL_VISITS,
        checklists: INITIAL_CHECKLISTS,
        templates: INITIAL_TEMPLATES,
        microsite: INITIAL_MICROSITE,
      }));
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      workspace,
      setWorkspace: setWorkspaceState,
      leads,
      properties,
      deals,
      visits,
      checklists,
      templates,
      microsite,
      plan,
      addLead,
      updateLead,
      deleteLead,
      updateLeadStage,
      checkDuplicatePhone,
      reactivateLead,
      importLeadsFromCSV,
      addProperty,
      updateProperty,
      deleteProperty,
      getMatchingPropertiesForLead,
      scheduleVisit,
      updateVisit,
      addDeal,
      updateDeal,
      updateChecklist,
      updateMicrosite,
      loadDemoData,
      canAddLead,
      canAddProperty,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
