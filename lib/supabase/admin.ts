import "server-only";

import { createClient } from "@supabase/supabase-js";

let cachedAdminClient: ReturnType<typeof createClient> | null = null;

function resolveServiceRoleKey(): string | undefined {
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cfContext = (globalThis as Record<symbol, any>)[Symbol.for("__cloudflare-context__")];
      key = cfContext?.env?.SUPABASE_SERVICE_ROLE_KEY;
    } catch {
      // Ignore context lookup errors outside Cloudflare
    }
  }
  return key;
}

/** Server-only client for privileged, verified workflows. Never import in client UI. */
export function createAdminClient() {
  if (cachedAdminClient) return cachedAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eauomwkwaxqpvzogdltq.supabase.co";
  const serviceRoleKey = resolveServiceRoleKey();
  if (!url || !serviceRoleKey) {
    throw new Error("This secure service is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY in the production environment.");
  }
  cachedAdminClient = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  return cachedAdminClient;
}
