import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("email OTP login keeps password login and protects OTP requests", async () => {
  const [login, otp, guide, migration, requestRoute, verifyRoute, callbackRoute, sender] = await Promise.all([
    read("app/login/LoginForm.tsx"),
    read("app/login/EmailOtpLoginForm.tsx"),
    read("docs/email-otp-setup.md"),
    read("supabase/migrations/20260824140000_add_custom_six_digit_email_otp.sql"),
    read("app/api/auth/email-otp/request/route.ts"),
    read("app/api/auth/email-otp/verify/route.ts"),
    read("app/auth/email-otp/callback/route.ts"),
    read("lib/auth/custom-email-otp.ts"),
  ]);
  assert.match(login, /Sign in using a six-digit email code/);
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
  assert.match(requestRoute, /email_confirmed_at/);
  assert.match(requestRoute, /email_not_confirmed/);
  assert.match(requestRoute, /Open the Varadhi Prep confirmation email/);
  assert.match(requestRoute, /issue_custom_email_login_challenge/);
  assert.match(verifyRoute, /consume_custom_email_login_challenge/);
  assert.match(verifyRoute, /email_confirmed_at/);
  assert.match(verifyRoute, /generateLink/);
  assert.match(verifyRoute, /hashed_token/);
  assert.match(callbackRoute, /verifyOtp/);
  assert.match(callbackRoute, /type: "magiclink"/);
  assert.match(sender, /api\.brevo\.com\/v3\/smtp\/email/);
  assert.match(sender, /createSixDigitOtp/);
});

test("registration stores mobile numbers and default student sign-in returns home", async () => {
  const [registration, phoneMigration, loginPage, registerPage, loginAction, verifyRoute, callbackRoute] = await Promise.all([
    read("app/register/RegisterForm.tsx"),
    read("supabase/migrations/20260826170000_store_student_phone_in_profiles.sql"),
    read("app/login/page.tsx"),
    read("app/register/page.tsx"),
    read("app/login/actions.ts"),
    read("app/api/auth/email-otp/verify/route.ts"),
    read("app/auth/email-otp/callback/route.ts"),
  ]);

  assert.match(registration, /data: \{ full_name: fullName\.trim\(\), phone: normalizedPhone \}/);
  assert.match(phoneMigration, /add column if not exists phone text/);
  assert.match(phoneMigration, /raw_user_meta_data ->> 'phone'/);
  for (const source of [loginPage, registerPage, loginAction, verifyRoute, callbackRoute]) {
    assert.doesNotMatch(source, /: "\/dashboard"/);
  }
});

test("state and exam catalogue cards show only the next useful content count", async () => {
  const [home, catalogue, examSelectionGrid] = await Promise.all([
    read("app/page.tsx"),
    read("app/mock-tests/page.tsx"),
    read("components/exams/ExamSelectionGrid.tsx"),
  ]);

  assert.doesNotMatch(home, /\{stateTests\} tests/);
  assert.doesNotMatch(home, /\{testCountByExam\.get\(exam\.id\)\} tests/);
  assert.doesNotMatch(catalogue, /\{stats\.tests\} tests/);
  assert.doesNotMatch(catalogue, /\{examTests\.length\} tests/);
  assert.doesNotMatch(home, /const activeExams = exams\.filter/);
  assert.doesNotMatch(catalogue, /tests\.some/);
  assert.match(home, /paper\{paperCount === 1/);
  assert.match(catalogue, /paperCount: papers\.filter/);
  assert.match(examSelectionGrid, /exam\.paperCount\} paper\{exam\.paperCount === 1/);
});

test("catalogue selection pages keep direct change links without a progress strip", async () => {
  const catalogue = await read("app/mock-tests/page.tsx");

  assert.match(catalogue, /href=\{stateUrl\(selectedState\.slug\)\}/);
  assert.match(catalogue, /href=\{examUrl\(selectedState\.slug, selectedExam\.slug\)\}/);
  assert.doesNotMatch(catalogue, /<CatalogSteps/);
});
