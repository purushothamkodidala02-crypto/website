import "server-only";

import { createClient } from "@supabase/supabase-js";

/** Server-only client for privileged, verified workflows. Never import in client UI. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("This secure service is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY in the production environment.");
  }
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
