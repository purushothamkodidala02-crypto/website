import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerActiveSessionToken, SINGLE_SESSION_COOKIE_NAME } from "@/lib/auth/single-session";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}&oauth_error=1`, requestUrl.origin));
  }

  const token = crypto.randomUUID();

  // Non-blocking async revocation of previous device sessions so student login is instantaneous
  void supabase.auth.signOut({ scope: "others" }).catch(() => null);

  // Concurrently register active session token and fetch profile in a single DB roundtrip
  const { data: updatedProfile } = await supabase
    .from("profiles")
    .update({
      active_session_token: token,
      active_session_updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("role, phone")
    .maybeSingle();

  let profile = updatedProfile;
  if (!profile) {
    const { data: fallbackProfile } = await supabase
      .from("profiles")
      .select("role, phone")
      .eq("id", user.id)
      .maybeSingle();
    profile = fallbackProfile;
  }

  if (!profile) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}&oauth_error=1`, requestUrl.origin));
  }

  if (profile.role === "admin") {
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return NextResponse.redirect(new URL(assurance?.currentLevel === "aal2" ? "/admin" : "/admin-mfa", requestUrl.origin));
  }

  await registerActiveSessionToken(supabase, user.id, token);

  if (!profile.phone) {
    const completeProfileUrl = new URL("/complete-profile", requestUrl.origin);
    completeProfileUrl.searchParams.set("next", nextPath);
    const response = NextResponse.redirect(completeProfileUrl);
    response.cookies.set(SINGLE_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));
  response.cookies.set(SINGLE_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
