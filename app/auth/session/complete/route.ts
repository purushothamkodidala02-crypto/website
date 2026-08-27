import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}&oauth_error=1`, requestUrl.origin));
  }

  if (profile.role === "admin") {
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return NextResponse.redirect(new URL(assurance?.currentLevel === "aal2" ? "/admin" : "/admin-mfa", requestUrl.origin));
  }

  const { error: sessionError } = await supabase.auth.signOut({ scope: "others" });
  if (sessionError) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}&oauth_error=1`, requestUrl.origin));
  }

  if (!profile.phone) {
    const completeProfileUrl = new URL("/complete-profile", requestUrl.origin);
    completeProfileUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(completeProfileUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
