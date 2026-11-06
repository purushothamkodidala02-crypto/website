import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const DEFAULT_SUPABASE_URL = "https://eauomwkwaxqpvzogdltq.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_0v7fVwvNLf399gtKqZ-S9Q_2mmaXmga";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookies cannot always be changed from Server Components.
            // Authentication refresh handling will be added later.
          }
        },
      },
    }
  );
}
