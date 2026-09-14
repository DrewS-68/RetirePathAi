import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton Supabase client to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'retirepath-auth-token',
          detectSessionInUrl: false, // Disabled to prevent refresh loops
        },
        realtime: {
          params: {
            eventsPerSecond: 0, // Disable realtime completely
          },
        },
        // Disable realtime WebSocket connections since we're not using them
        db: {
          schema: 'public',
        },
      }
    );
  }
  return supabaseInstance;
}