import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("email OTP login keeps password login and protects OTP requests", async () => {
  const [login, otp, guide, migration, requestRoute, verifyRoute, sender] = await Promise.all([
    read("app/login/LoginForm.tsx"),
    read("app/login/EmailOtpLoginForm.tsx"),
    read("docs/email-otp-setup.md"),
    read("supabase/migrations/20260824140000_add_custom_six_digit_email_otp.sql"),
    read("app/api/auth/email-otp/request/route.ts"),
    read("app/api/auth/email-otp/verify/route.ts"),
    read("lib/auth/custom-email-otp.ts"),
  ]);
  assert.match(login, /Sign in with Email OTP instead/);
  assert.match(login, /EmailOtpLoginForm/);
  assert.match(otp, /\/api\/auth\/email-otp\/request/);
  assert.match(otp, /captchaToken/);
  assert.match(otp, /\/api\/auth\/email-otp\/verify/);
  assert.match(otp, /autoComplete="one-time-code"/);
  assert.match(guide, /exactly 6 digits/);
  assert.match(migration, /code_hash text not null/);
  assert.match(migration, /interval '10 minutes'/);
  assert.match(migration, /attempts >= 5/);
  assert.match(migration, /service_role/);
  assert.match(requestRoute, /verifyTurnstile/);
  assert.match(requestRoute, /issue_custom_email_login_challenge/);
  assert.match(verifyRoute, /consume_custom_email_login_challenge/);
  assert.match(verifyRoute, /generateLink/);
  assert.match(sender, /api\.brevo\.com\/v3\/smtp\/email/);
  assert.match(sender, /createSixDigitOtp/);
});
