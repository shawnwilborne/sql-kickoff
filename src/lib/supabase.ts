import { createClient } from '@supabase/supabase-js';

// These are the project's PUBLIC client credentials. The publishable/anon key is
// safe to ship in the browser — access is governed by row-level security.
// They can be overridden at build time via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://fselwgkdsbmqybjmzbpx.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_WeECiIt0KMLfI03QKsqhXw_PdDGW7nu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/** A row of the public.profiles table (per-user progress + leaderboard source). */
export interface ProfileRow {
  user_id: string;
  name: string;
  xp: number;
  awarded_concepts: string[];
  badges: string[];
  completed_challenges: string[];
  sqlite_challenges: number;
  postgres_challenges: number;
  first_query_done: boolean;
  sample_loaded: boolean;
  last_active: string;
  updated_at?: string;
}
