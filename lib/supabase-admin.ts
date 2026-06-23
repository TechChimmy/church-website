// lib/supabase-admin.ts
//
// Server-only Supabase client, authenticated with the service role key.
// Used exclusively for Supabase Storage operations (upload/delete) from
// admin API routes. NEVER import this from client components — the
// service role key bypasses Row Level Security and must stay server-side.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  // Don't throw at import time (would break builds before env vars are set),
  // but make the misconfiguration loud in logs.
  console.warn(
    "[supabase-admin] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. " +
      "Image uploads to Supabase Storage will fail until both are set in your environment."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-service-role-key",
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

/** Name of the public Supabase Storage bucket used for all CMS-uploaded images. */
export const CMS_BUCKET = "cms-images";
