// Server-only Supabase client. Uses the service-role key, so it must NEVER be
// imported into a client component — only API routes / server code. Like the
// other integrations in this project, everything degrades gracefully: when the
// env vars are absent, isSupabaseConfigured() is false and callers fall back to
// the bundled demo data, so the site keeps working before the DB is set up.
//
// Required env vars (Vercel → Settings → Environment Variables):
//   SUPABASE_URL                — https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   — Project Settings → API → service_role key

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cached;
}
