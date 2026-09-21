import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client with the Service Role Key.
 * Only use in secure server environments (API routes, webhooks, cron jobs).
 * Never expose to the browser!
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('your-service-role-key')) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
