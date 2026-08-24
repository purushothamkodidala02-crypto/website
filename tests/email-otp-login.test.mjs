import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("email OTP login keeps password login and protects OTP requests", async () => {
  const [login, otp, guide] = await Promise.all([
    read("app/login/LoginForm.tsx"),
    read("app/login/EmailOtpLoginForm.tsx"),
    read("docs/email-otp-setup.md"),
  ]);
  assert.match(login, /Sign in with Email OTP instead/);
  assert.match(login, /EmailOtpLoginForm/);
  assert.match(otp, /signInWithOtp/);
  assert.match(otp, /shouldCreateUser: false/);
  assert.match(otp, /captchaToken/);
  assert.match(otp, /verifyOtp/);
  assert.match(otp, /type: "email"/);
  assert.match(otp, /autoComplete="one-time-code"/);
  assert.match(guide, /\{\{ \.Token \}\}/);
});
