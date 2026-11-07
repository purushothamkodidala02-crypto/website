import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerActiveSessionToken } from "@/lib/auth/single-session";

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

  // Fetch profile and clean other sessions concurrently to eliminate login delay
  const [{ data: profile }, { error: sessionError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, phone")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.auth.signOut({ scope: "others" }),
  ]);

  if (!profile) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}&oauth_error=1`, requestUrl.origin));
  }

  if (profile.role === "admin") {
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return NextResponse.redirect(new URL(assurance?.currentLevel === "aal2" ? "/admin" : "/admin-mfa", requestUrl.origin));
  }

  if (sessionError) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}&oauth_error=1`, requestUrl.origin));
  }

  await registerActiveSessionToken(supabase, user.id);

  if (!profile.phone) {
    const completeProfileUrl = new URL("/complete-profile", requestUrl.origin);
    completeProfileUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(completeProfileUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
