import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("next", nextPath);

  if (!tokenHash || tokenHash.length > 2048) return NextResponse.redirect(loginUrl);

  // Create the redirect response before verifying the Supabase token. Supabase
  // writes the new session cookies onto this exact response, so they survive
  // the redirect to the protected dashboard.
  const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin));
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(values) {
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
  if (error) return NextResponse.redirect(loginUrl);

  return response;
}
