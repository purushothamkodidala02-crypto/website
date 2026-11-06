import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SINGLE_SESSION_COOKIE_NAME = "varadhi_session_token";

/**
 * Reads the active device session token from request cookies.
 */
export async function getActiveSessionToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SINGLE_SESSION_COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Sets the active device session token on response cookies (Server Action / Route Handler).
 */
export async function setActiveSessionToken(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SINGLE_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch {
    // Read-only server components cannot set cookies directly
  }
}

/**
 * Clears the active device session token cookie.
 */
export async function clearActiveSessionToken(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SINGLE_SESSION_COOKIE_NAME);
  } catch {
    // Ignore if unmodifiable
  }
}

/**
 * Registers a new active session token in the database for single-device tracking.
 */
export async function registerActiveSessionToken(
  supabase: SupabaseClient,
  userId: string,
  newToken?: string,
): Promise<string> {
  const token = newToken || crypto.randomUUID();

  // Update profiles table
  const { error } = await supabase
    .from("profiles")
    .update({
      active_session_token: token,
      active_session_updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    // If column doesn't exist yet during rollout, fallback silently
    console.warn("Could not register active_session_token in profiles:", error.message);
  }

  await setActiveSessionToken(token);
  return token;
}

/**
 * Checks whether the current device holds the active session for the authenticated student.
 * Administrators are always considered valid (exempt from single-device displacement).
 */
export async function verifyActiveSession(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const cookieToken = await getActiveSessionToken();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, active_session_token")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile) {
      return { valid: true };
    }

    if (profile.role === "admin") {
      return { valid: true };
    }

    // If no active session token was ever registered in DB or cookie is missing before migration, allow
    if (!profile.active_session_token || !cookieToken) {
      return { valid: true };
    }

    if (profile.active_session_token !== cookieToken) {
      return { valid: false, reason: "displaced_by_another_device" };
    }

    return { valid: true };
  } catch {
    return { valid: true };
  }
}
