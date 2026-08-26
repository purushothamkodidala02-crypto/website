import { createSixDigitOtp, hashIp, hashOtp, normalizeEmail, sendSixDigitOtp, verifyTurnstile } from "@/lib/auth/custom-email-otp";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function ipFromHeaders(values: Headers) { return values.get("x-forwarded-for")?.split(",")[0]?.trim() ?? values.get("x-real-ip") ?? ""; }

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ message: "Invalid request origin." }, { status: 403 });
  const payload = await request.json().catch(() => null) as { email?: unknown; captchaToken?: unknown } | null;
  const email = normalizeEmail(payload?.email); const captchaToken = String(payload?.captchaToken ?? "");
  const ip = ipFromHeaders(request.headers);
  if (!email || !captchaToken) return Response.json({ message: "Complete your email and security verification." }, { status: 400 });
  try {
    if (!await verifyTurnstile(captchaToken, ip)) return Response.json({ message: "Security verification was rejected. Please try again." }, { status: 400 });
    const admin = createAdminClient();
    const { data: userId } = await admin.rpc("find_auth_user_id_by_email", { requested_email: email });
    if (!userId) return Response.json({ ok: true });
    const { data: authUser, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError) return Response.json({ ok: true });
    if (!authUser.user?.email_confirmed_at) {
      return Response.json(
        {
          code: "email_not_confirmed",
          message: "Your email address is not confirmed. Open the Varadhi Prep confirmation email, confirm your account, and then request a sign-in code.",
        },
        { status: 403 },
      );
    }
    const otp = createSixDigitOtp();
    const { error } = await admin.rpc("issue_custom_email_login_challenge", { requested_user_id: userId, requested_email: email, requested_code_hash: hashOtp(`${email}:${otp}`), requested_ip_hash: hashIp(ip) });
    if (error) return Response.json({ message: error.message.includes("wait") || error.message.includes("Too many") ? error.message : "We could not send a code right now. Please try again shortly." }, { status: error.message.includes("wait") || error.message.includes("Too many") ? 429 : 500 });
    await sendSixDigitOtp(email, otp);
    return Response.json({ ok: true });
  } catch (error) { return Response.json({ message: error instanceof Error ? error.message : "We could not send a code right now." }, { status: 503 }); }
}
