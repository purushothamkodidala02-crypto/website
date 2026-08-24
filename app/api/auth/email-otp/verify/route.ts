import { absoluteUrl } from "@/lib/site";
import { hashOtp, normalizeEmail } from "@/lib/auth/custom-email-otp";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function safeNext(value: unknown) { const path = String(value ?? "/dashboard"); return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard"; }

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ message: "Invalid request origin." }, { status: 403 });
  const payload = await request.json().catch(() => null) as { email?: unknown; code?: unknown; nextPath?: unknown } | null;
  const email = normalizeEmail(payload?.email); const code = String(payload?.code ?? "");
  if (!email || !/^\d{6}$/.test(code)) return Response.json({ message: "Enter the six-digit code from your email." }, { status: 400 });
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("consume_custom_email_login_challenge", { requested_email: email, requested_code_hash: hashOtp(`${email}:${code}`) });
    if (error) return Response.json({ message: error.message.includes("Too many") ? error.message : "That code is invalid or has expired." }, { status: 400 });
    const nextPath = safeNext(payload?.nextPath);
    const { data, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo: absoluteUrl(nextPath) } });
    const tokenHash = data?.properties?.hashed_token;
    if (linkError || !tokenHash) return Response.json({ message: "We could not complete sign-in. Please try again." }, { status: 503 });
    // The callback verifies Supabase's one-time token server-side and persists
    // the session cookies before sending the student to the requested page.
    const callbackUrl = new URL("/auth/email-otp/callback", absoluteUrl("/"));
    callbackUrl.searchParams.set("token_hash", tokenHash);
    callbackUrl.searchParams.set("next", nextPath);
    const redirectUrl = callbackUrl.toString();
    return Response.json({ redirectUrl });
  } catch (error) { return Response.json({ message: error instanceof Error ? error.message : "We could not verify the code." }, { status: 503 }); }
}
