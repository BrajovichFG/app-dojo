import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabaseConfig';

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!SUPABASE_CONFIG.isConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
  return client;
};
