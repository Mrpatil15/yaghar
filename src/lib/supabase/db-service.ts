import { supabase, isSupabaseConfigured } from './client';
import { 
  Workspace, Lead, Property, Deal, SiteVisit, Microsite 
} from '@/types/database.types';

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function ensureUUID(id?: string): string {
  if (id && isValidUUID(id)) return id;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Health check to see if Supabase is configured and reachable.
 */
export async function checkDbConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { connected: false, error: 'Supabase credentials not configured' };
  }

  try {
    const { data, error } = await supabase.from('workspaces').select('id').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Network connection failed' };
  }
}

// ==========================================
// WORKSPACE SERVICES
// ==========================================

export async function fetchWorkspaceFromDb(slugOrId?: string): Promise<Workspace | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    let query = supabase.from('workspaces').select('*');
    if (slugOrId) {
      if (isValidUUID(slugOrId)) {
        query = query.eq('id', slugOrId);
      } else {
        query = query.eq('slug', slugOrId);
      }
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error || !data) return null;
    return data as Workspace;
  } catch (err) {
    console.error('Error fetching workspace from Supabase:', err);
    return null;
  }
}

export async function saveWorkspaceToDb(workspace: Workspace): Promise<Workspace | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const payload = {
      ...workspace,
      id: ensureUUID(workspace.id),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('workspaces')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Failed to upsert workspace to Supabase:', error);
      return null;
    }
    return data as Workspace;
  } catch (err) {
    console.error('Error saving workspace:', err);
    return null;
  }
}

// ==========================================
// LEADS SERVICES
// ==========================================

export async function fetchLeadsFromDb(workspaceId: string): Promise<Lead[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (isValidUUID(workspaceId)) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch leads from Supabase:', error);
      return [];
    }
    return (data || []) as Lead[];
  } catch (err) {
    console.error('Error fetching leads:', err);
    return [];
  }
}

export async function insertLeadToDb(lead: Lead): Promise<Lead | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const payload = {
      ...lead,
      id: ensureUUID(lead.id),
      workspace_id: isValidUUID(lead.workspace_id) ? lead.workspace_id : ensureUUID(),
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Failed to insert lead into Supabase:', error);
      return null;
    }
    return data as Lead;
  } catch (err) {
    console.error('Error inserting lead:', err);
    return null;
  }
}

export async function updateLeadInDb(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  if (!isSupabaseConfigured() || !supabase || !isValidUUID(id)) return null;

  try {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update lead in Supabase:', error);
      return null;
    }
    return data as Lead;
  } catch (err) {
    console.error('Error updating lead:', err);
    return null;
  }
}

export async function deleteLeadFromDb(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase || !isValidUUID(id)) return false;

  try {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete lead from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting lead:', err);
    return false;
  }
}

// ==========================================
// PROPERTIES SERVICES
// ==========================================

export async function fetchPropertiesFromDb(workspaceId: string): Promise<Property[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    let query = supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (isValidUUID(workspaceId)) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch properties from Supabase:', error);
      return [];
    }
    return (data || []) as Property[];
  } catch (err) {
    console.error('Error fetching properties:', err);
    return [];
  }
}

export async function insertPropertyToDb(property: Property): Promise<Property | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const payload = {
      ...property,
      id: ensureUUID(property.id),
      workspace_id: isValidUUID(property.workspace_id) ? property.workspace_id : ensureUUID(),
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Failed to insert property into Supabase:', error);
      return null;
    }
    return data as Property;
  } catch (err) {
    console.error('Error inserting property:', err);
    return null;
  }
}

export async function updatePropertyInDb(id: string, updates: Partial<Property>): Promise<Property | null> {
  if (!isSupabaseConfigured() || !supabase || !isValidUUID(id)) return null;

  try {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('properties')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update property in Supabase:', error);
      return null;
    }
    return data as Property;
  } catch (err) {
    console.error('Error updating property:', err);
    return null;
  }
}

export async function deletePropertyFromDb(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase || !isValidUUID(id)) return false;

  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete property from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting property:', err);
    return false;
  }
}

// ==========================================
// DEALS SERVICES
// ==========================================

export async function fetchDealsFromDb(workspaceId: string): Promise<Deal[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (isValidUUID(workspaceId)) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch deals from Supabase:', error);
      return [];
    }
    return (data || []) as Deal[];
  } catch (err) {
    console.error('Error fetching deals:', err);
    return [];
  }
}

export async function insertDealToDb(deal: Deal): Promise<Deal | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const payload = {
      ...deal,
      id: ensureUUID(deal.id),
      workspace_id: isValidUUID(deal.workspace_id) ? deal.workspace_id : ensureUUID(),
    };

    const { data, error } = await supabase
      .from('deals')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Failed to insert deal into Supabase:', error);
      return null;
    }
    return data as Deal;
  } catch (err) {
    console.error('Error inserting deal:', err);
    return null;
  }
}

export async function updateDealInDb(id: string, updates: Partial<Deal>): Promise<Deal | null> {
  if (!isSupabaseConfigured() || !supabase || !isValidUUID(id)) return null;

  try {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('deals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update deal in Supabase:', error);
      return null;
    }
    return data as Deal;
  } catch (err) {
    console.error('Error updating deal:', err);
    return null;
  }
}

// ==========================================
// SITE VISITS SERVICES
// ==========================================

export async function fetchVisitsFromDb(workspaceId: string): Promise<SiteVisit[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    let query = supabase.from('site_visits').select('*').order('scheduled_at', { ascending: true });
    if (isValidUUID(workspaceId)) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch visits from Supabase:', error);
      return [];
    }
    return (data || []) as SiteVisit[];
  } catch (err) {
    console.error('Error fetching site visits:', err);
    return [];
  }
}

export async function insertVisitToDb(visit: SiteVisit): Promise<SiteVisit | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const payload = {
      ...visit,
      id: ensureUUID(visit.id),
      workspace_id: isValidUUID(visit.workspace_id) ? visit.workspace_id : ensureUUID(),
    };

    const { data, error } = await supabase
      .from('site_visits')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Failed to insert site visit into Supabase:', error);
      return null;
    }
    return data as SiteVisit;
  } catch (err) {
    console.error('Error inserting site visit:', err);
    return null;
  }
}

export async function updateVisitInDb(id: string, updates: Partial<SiteVisit>): Promise<SiteVisit | null> {
  if (!isSupabaseConfigured() || !supabase || !isValidUUID(id)) return null;

  try {
    const { data, error } = await supabase
      .from('site_visits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update site visit in Supabase:', error);
      return null;
    }
    return data as SiteVisit;
  } catch (err) {
    console.error('Error updating site visit:', err);
    return null;
  }
}

// ==========================================
// MICROSITE SERVICES
// ==========================================

export async function fetchMicrositeFromDb(workspaceId: string): Promise<Microsite | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    let query = supabase.from('microsites').select('*');
    if (isValidUUID(workspaceId)) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query.limit(1).maybeSingle();
    if (error || !data) return null;
    return data as Microsite;
  } catch (err) {
    console.error('Error fetching microsite from Supabase:', err);
    return null;
  }
}

export async function saveMicrositeToDb(microsite: Microsite): Promise<Microsite | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const payload = {
      ...microsite,
      workspace_id: isValidUUID(microsite.workspace_id) ? microsite.workspace_id : ensureUUID(),
    };

    const { data, error } = await supabase
      .from('microsites')
      .upsert(payload, { onConflict: 'workspace_id' })
      .select()
      .single();

    if (error) {
      console.error('Failed to save microsite to Supabase:', error);
      return null;
    }
    return data as Microsite;
  } catch (err) {
    console.error('Error saving microsite:', err);
    return null;
  }
}
