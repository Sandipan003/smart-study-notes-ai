import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export async function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`Config fetch failed: ${response.statusText}`);
    }
    const config = await response.json();
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Supabase URL or Key is missing in server environment.');
    }
    
    // Trim keys to avoid whitespaces causing issues
    const url = config.supabaseUrl.trim();
    const key = config.supabaseKey.trim();

    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    throw error;
  }
}
