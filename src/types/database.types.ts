export type PlanTier = 'trial' | 'starter' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled';
export type UserRole = 'owner' | 'admin' | 'agent';

export type LeadStage = 'new' | 'contacted' | 'site_visit' | 'negotiation' | 'booked' | 'lost';
export type LeadSource = 
  | '99acres' 
  | 'magicbricks' 
  | 'housing' 
  | 'meta_ads' 
  | 'google_ads' 
  | 'microsite' 
  | 'referral' 
  | 'walk_in' 
  | 'manual';

export type ListingType = 'new_project' | 'resale' | 'rental';
export type PropertyType = 'apartment' | 'villa' | 'plot' | 'commercial';
export type PossessionStatus = 'ready_to_move' | 'under_construction';
export type PropertyStatus = 'available' | 'under_offer' | 'sold' | 'rented';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  brand_color: string;
  phone?: string | null;
  email?: string | null;
  city: string;
  focus_localities: string[];
  rera_number?: string | null;
  plan_tier: PlanTier;
  trial_ends_at: string;
  razorpay_customer_id?: string | null;
  razorpay_subscription_id?: string | null;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  invited_email?: string | null;
  status: 'active' | 'invited' | 'suspended';
  created_at: string;
  user_name?: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  assigned_to?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  stage: LeadStage;
  source: LeadSource;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_bhk: string[];
  preferred_localities: string[];
  property_type: string;
  tags: string[];
  notes?: string | null;
  is_dead: boolean;
  dead_reason?: string | null;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  workspace_id: string;
  lead_id: string;
  actor_id?: string | null;
  type: 'note' | 'call' | 'whatsapp_sent' | 'stage_change' | 'site_visit_scheduled' | 'property_shared';
  title: string;
  description?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface FollowUp {
  id: string;
  workspace_id: string;
  lead_id: string;
  assigned_to?: string | null;
  due_date: string;
  notes?: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Property {
  id: string;
  workspace_id: string;
  title: string;
  listing_type: ListingType;
  property_type: PropertyType;
  city: string;
  locality: string;
  sub_locality?: string | null;
  bhk: string;
  carpet_area: number;
  super_builtup_area?: number | null;
  price: number;
  maintenance_charge?: number;
  rera_number?: string | null;
  possession_date?: string | null;
  possession_status: PossessionStatus;
  floor_number?: number | null;
  total_floors?: number | null;
  furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
  amenities: string[];
  description?: string | null;
  status: PropertyStatus;
  location_pin_url?: string | null;
  brochure_url?: string | null;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface PropertyMedia {
  id: string;
  workspace_id: string;
  property_id: string;
  url: string;
  media_type: 'image' | 'video' | 'floor_plan';
  display_order: number;
  created_at: string;
}

export interface Shortlist {
  id: string;
  workspace_id: string;
  lead_id: string;
  property_id: string;
  status: 'suggested' | 'shared' | 'liked' | 'disliked' | 'visited';
  notes?: string | null;
  created_at: string;
}

export interface SiteVisit {
  id: string;
  workspace_id: string;
  lead_id: string;
  property_id: string;
  assigned_to?: string | null;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  outcome_notes?: string | null;
  feedback_rating?: number | null;
  created_at: string;
  lead?: Lead;
  property?: Property;
}

export interface Deal {
  id: string;
  workspace_id: string;
  lead_id: string;
  property_id: string;
  deal_value: number;
  deal_type: 'sale' | 'rental';
  brokerage_percentage: number;
  total_commission: number;
  gst_applicable: boolean;
  gst_amount: number;
  expected_payout_date?: string | null;
  received_amount: number;
  status: 'in_progress' | 'closed' | 'cancelled';
  invoice_number?: string | null;
  client_gstin?: string | null;
  client_pan?: string | null;
  invoice_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  property?: Property;
}

export interface Commission {
  id: string;
  workspace_id: string;
  deal_id: string;
  member_id: string;
  split_percentage: number;
  amount: number;
  paid_status: 'pending' | 'paid';
  paid_at?: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id?: string;
  name: string;
  checked: boolean;
  file_url?: string | null;
}

export interface Checklist {
  id: string;
  workspace_id: string;
  deal_id?: string | null;
  title: string;
  category: 'buy' | 'sell' | 'rent';
  items: ChecklistItem[];
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  workspace_id: string;
  lead_id?: string | null;
  property_id?: string | null;
  deal_id?: string | null;
  name: string;
  doc_type: string;
  file_url: string;
  file_size?: number | null;
  created_at: string;
}

export interface Template {
  id: string;
  workspace_id: string;
  name: string;
  category: 'welcome' | 'property_share' | 'site_visit' | 'follow_up' | 'reactivate' | 'deal_closing';
  content: string;
  is_default: boolean;
  created_at: string;
}

export interface Testimonial {
  client_name: string;
  role: string;
  text: string;
  avatar_url?: string;
}

export interface Microsite {
  id: string;
  workspace_id: string;
  tagline?: string | null;
  about_text?: string | null;
  experience_years: number;
  properties_sold: number;
  happy_clients: number;
  testimonials: Testimonial[];
  social_links: Record<string, string>;
  qr_code_url?: string | null;
  is_published: boolean;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  workspace_id: string;
  source: string;
  name: string;
  phone: string;
  email?: string | null;
  requirement_summary?: string | null;
  payload?: Record<string, any>;
  created_at: string;
}

export interface AdSource {
  id: string;
  workspace_id: string;
  platform: 'meta' | 'google' | '99acres' | 'magicbricks';
  campaign_name: string;
  ad_spend: number;
  leads_count: number;
  created_at: string;
}
