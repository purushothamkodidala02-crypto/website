"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyActiveSession } from "@/lib/auth/single-session";

export async function checkActiveSessionStatus(): Promise<{
  authenticated: boolean;
  valid: boolean;
  reason?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { authenticated: false, valid: true };
    }

    const verification = await verifyActiveSession(supabase, user.id);
    return {
      authenticated: true,
      valid: verification.valid,
      reason: verification.reason,
    };
  } catch {
    return { authenticated: true, valid: true };
  }
}
