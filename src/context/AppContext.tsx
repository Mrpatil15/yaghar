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
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { 
  checkDbConnection, 
  fetchWorkspaceFromDb, 
  saveWorkspaceToDb,
  fetchLeadsFromDb, 
  insertLeadToDb, 
  updateLeadInDb, 
  deleteLeadFromDb,
  fetchPropertiesFromDb, 
  insertPropertyToDb, 
  updatePropertyInDb, 
  deletePropertyFromDb,
  fetchDealsFromDb, 
  insertDealToDb, 
  updateDealInDb,
  fetchVisitsFromDb, 
  insertVisitToDb, 
  updateVisitInDb,
  fetchMicrositeFromDb, 
  saveMicrositeToDb 
} from '@/lib/supabase/db-service';

export type DbStatus = 'checking' | 'connected' | 'demo';

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
  dbStatus: DbStatus;
  isDbConnected: boolean;
  syncWithDatabase: () => Promise<void>;
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

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

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
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');

  const syncWithDatabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setDbStatus('demo');
      return;
    }

    setDbStatus('checking');
    const health = await checkDbConnection();
    if (!health.connected) {
      setDbStatus('demo');
      return;
    }

    setDbStatus('connected');
    try {
      const [cloudWs, cloudLeads, cloudProps, cloudDeals, cloudVisits, cloudMicro] = await Promise.all([
        fetchWorkspaceFromDb(),
        fetchLeadsFromDb(workspace.id),
        fetchPropertiesFromDb(workspace.id),
        fetchDealsFromDb(workspace.id),
        fetchVisitsFromDb(workspace.id),
        fetchMicrositeFromDb(workspace.id),
      ]);

      if (cloudWs) setWorkspaceState(cloudWs);
      if (cloudLeads && cloudLeads.length > 0) setLeads(cloudLeads);
      if (cloudProps && cloudProps.length > 0) setProperties(cloudProps);
      if (cloudDeals && cloudDeals.length > 0) setDeals(cloudDeals);
      if (cloudVisits && cloudVisits.length > 0) setVisits(cloudVisits);
      if (cloudMicro) setMicrosite(cloudMicro);
    } catch (e) {
      console.warn('Sync failed, using existing state:', e);
    }
  }, [workspace.id]);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    async function initializeState() {
      if (isSupabaseConfigured()) {
        const health = await checkDbConnection();
        if (health.connected && isMounted) {
          setDbStatus('connected');
          try {
            const [cloudWs, cloudLeads, cloudProps, cloudDeals, cloudVisits, cloudMicro] = await Promise.all([
              fetchWorkspaceFromDb(),
              fetchLeadsFromDb(INITIAL_WORKSPACE.id),
              fetchPropertiesFromDb(INITIAL_WORKSPACE.id),
              fetchDealsFromDb(INITIAL_WORKSPACE.id),
              fetchVisitsFromDb(INITIAL_WORKSPACE.id),
              fetchMicrositeFromDb(INITIAL_WORKSPACE.id),
            ]);

            if (cloudWs) setWorkspaceState(cloudWs);
            if (cloudLeads && cloudLeads.length > 0) setLeads(cloudLeads);
            if (cloudProps && cloudProps.length > 0) setProperties(cloudProps);
            if (cloudDeals && cloudDeals.length > 0) setDeals(cloudDeals);
            if (cloudVisits && cloudVisits.length > 0) setVisits(cloudVisits);
            if (cloudMicro) setMicrosite(cloudMicro);

            setIsLoaded(true);
            return;
          } catch (e) {
            console.warn('Failed to load from Supabase, falling back to local storage', e);
          }
        }
      }

      // Fallback to LocalStorage / Demo data
      if (isMounted) {
        setDbStatus('demo');
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
      }
    }

    initializeState();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save to LocalStorage as safety cache
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
      id: generateId('lead'),
      workspace_id: workspace.id,
      is_dead: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLeads(prev => [newLead, ...prev]);

    if (dbStatus === 'connected') {
      insertLeadToDb(newLead).catch(err => console.error('Failed to insert lead into Supabase:', err));
    }

    return { success: true, lead: newLead };
  }, [canAddLead, checkDuplicatePhone, plan.limits.maxLeads, workspace.id, dbStatus]);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l));

    if (dbStatus === 'connected') {
      updateLeadInDb(id, updates).catch(err => console.error('Failed to update lead in Supabase:', err));
    }
  }, [dbStatus]);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));

    if (dbStatus === 'connected') {
      deleteLeadFromDb(id).catch(err => console.error('Failed to delete lead from Supabase:', err));
    }
  }, [dbStatus]);

  const updateLeadStage = useCallback((id: string, stage: LeadStage) => {
    const isDead = stage === 'lost';
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      return {
        ...l,
        stage,
        is_dead: isDead,
        updated_at: new Date().toISOString(),
      };
    }));

    if (dbStatus === 'connected') {
      updateLeadInDb(id, { stage, is_dead: isDead }).catch(err => console.error('Failed to update stage in Supabase:', err));
    }
  }, [dbStatus]);

  const reactivateLead = useCallback((id: string) => {
    const updates = {
      stage: 'contacted' as LeadStage,
      is_dead: false,
      dead_reason: undefined,
      last_contacted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

    if (dbStatus === 'connected') {
      updateLeadInDb(id, updates).catch(err => console.error('Failed to reactivate lead in Supabase:', err));
    }
  }, [dbStatus]);

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

      const createdLead: Lead = {
        id: generateId('lead-csv'),
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
      };

      newLeads.push(createdLead);
      imported++;

      if (dbStatus === 'connected') {
        insertLeadToDb(createdLead).catch(err => console.error('Failed to import lead to Supabase:', err));
      }
    });

    if (newLeads.length > 0) {
      setLeads(prev => [...newLeads, ...prev]);
    }
    return { imported, duplicates };
  }, [leads, workspace.id, dbStatus]);

  const addProperty = useCallback((propData: Omit<Property, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>) => {
    if (!canAddProperty()) {
      return { success: false, error: `Plan limit of ${plan.limits.maxProperties} properties reached. Please upgrade.` };
    }

    const newProp: Property = {
      ...propData,
      id: generateId('prop'),
      workspace_id: workspace.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProperties(prev => [newProp, ...prev]);

    if (dbStatus === 'connected') {
      insertPropertyToDb(newProp).catch(err => console.error('Failed to insert property into Supabase:', err));
    }

    return { success: true, property: newProp };
  }, [canAddProperty, plan.limits.maxProperties, workspace.id, dbStatus]);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));

    if (dbStatus === 'connected') {
      updatePropertyInDb(id, updates).catch(err => console.error('Failed to update property in Supabase:', err));
    }
  }, [dbStatus]);

  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));

    if (dbStatus === 'connected') {
      deletePropertyFromDb(id).catch(err => console.error('Failed to delete property from Supabase:', err));
    }
  }, [dbStatus]);

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
        score += 20;
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
        score += 15;
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
      id: generateId('visit'),
      workspace_id: workspace.id,
      created_at: new Date().toISOString(),
    };
    setVisits(prev => [newVisit, ...prev]);

    if (dbStatus === 'connected') {
      insertVisitToDb(newVisit).catch(err => console.error('Failed to insert site visit into Supabase:', err));
    }

    updateLeadStage(visitData.lead_id, 'site_visit');
  }, [updateLeadStage, workspace.id, dbStatus]);

  const updateVisit = useCallback((id: string, updates: Partial<SiteVisit>) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

    if (dbStatus === 'connected') {
      updateVisitInDb(id, updates).catch(err => console.error('Failed to update visit in Supabase:', err));
    }
  }, [dbStatus]);

  const addDeal = useCallback((dealData: Omit<Deal, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: generateId('deal'),
      workspace_id: workspace.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDeals(prev => [newDeal, ...prev]);

    if (dbStatus === 'connected') {
      insertDealToDb(newDeal).catch(err => console.error('Failed to insert deal into Supabase:', err));
    }

    updateLeadStage(dealData.lead_id, 'booked');
  }, [updateLeadStage, workspace.id, dbStatus]);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d));

    if (dbStatus === 'connected') {
      updateDealInDb(id, updates).catch(err => console.error('Failed to update deal in Supabase:', err));
    }
  }, [dbStatus]);

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
    setMicrosite(prev => {
      const updated = { ...prev, ...updates };
      if (dbStatus === 'connected') {
        saveMicrositeToDb(updated).catch(err => console.error('Failed to update microsite in Supabase:', err));
      }
      return updated;
    });
  }, [dbStatus]);

  const setWorkspace = useCallback((ws: Workspace) => {
    setWorkspaceState(ws);
    if (dbStatus === 'connected') {
      saveWorkspaceToDb(ws).catch(err => console.error('Failed to update workspace in Supabase:', err));
    }
  }, [dbStatus]);

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
      setWorkspace,
      leads,
      properties,
      deals,
      visits,
      checklists,
      templates,
      microsite,
      plan,
      dbStatus,
      isDbConnected: dbStatus === 'connected',
      syncWithDatabase,
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
