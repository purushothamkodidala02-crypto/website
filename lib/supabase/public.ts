import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://eauomwkwaxqpvzogdltq.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_0v7fVwvNLf399gtKqZ-S9Q_2mmaXmga";

export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
