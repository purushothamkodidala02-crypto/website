import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://eauomwkwaxqpvzogdltq.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_0v7fVwvNLf399gtKqZ-S9Q_2mmaXmga";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
  );
}
