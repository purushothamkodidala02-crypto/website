import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function loginErrorUrl(origin: string, nextPath: string) {
  const url = new URL("/login", origin);
  url.searchParams.set("next", nextPath);
  url.searchParams.set("oauth_error", "1");
  return url;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));

  if (!code || code.length > 4096) {
    return NextResponse.redirect(loginErrorUrl(requestUrl.origin, nextPath));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(loginErrorUrl(requestUrl.origin, nextPath));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(loginErrorUrl(requestUrl.origin, nextPath));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(loginErrorUrl(requestUrl.origin, nextPath));
  }

  if (profile.role === "admin") {
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return NextResponse.redirect(new URL(assurance?.currentLevel === "aal2" ? "/admin" : "/admin-mfa", requestUrl.origin));
  }

  if (!profile.phone) {
    const completeProfileUrl = new URL("/complete-profile", requestUrl.origin);
    completeProfileUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(completeProfileUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
