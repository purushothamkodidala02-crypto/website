import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Google login uses a secure OAuth callback and preserves the requested destination", async () => {
  const [button, callback, login, register] = await Promise.all([
    read("components/auth/GoogleSignInButton.tsx"),
    read("app/auth/oauth/callback/route.ts"),
    read("app/login/LoginForm.tsx"),
    read("app/register/RegisterForm.tsx"),
  ]);

  assert.match(button, /provider: "google"/);
  assert.match(button, /\/auth\/oauth\/callback/);
  assert.match(button, /Continue with Google/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /value\?\.startsWith\("\/"\) && !value\.startsWith\("\/\/"\)/);
  assert.match(callback, /profile\.role === "admin"/);
  assert.match(login, /GoogleSignInButton/);
  assert.match(register, /GoogleSignInButton/);
});

test("new social-login students complete a verified mobile profile before continuing", async () => {
  const [callback, page, form, action] = await Promise.all([
    read("app/auth/oauth/callback/route.ts"),
    read("app/complete-profile/page.tsx"),
    read("app/complete-profile/CompleteProfileForm.tsx"),
    read("app/complete-profile/actions.ts"),
  ]);

  assert.match(callback, /if \(!profile\.phone\)/);
  assert.match(callback, /\/complete-profile/);
  assert.match(page, /Google securely confirmed your name and email/);
  assert.match(form, /autoComplete="tel-national"/);
  assert.match(action, /normaliseIndianMobile/);
  assert.match(action, /supabase\.auth\.getUser\(\)/);
  assert.match(action, /profile\.role !== "student"/);
  assert.match(action, /updateUserById/);
  assert.match(action, /\.update\(\{ full_name: fullName, phone \}\)/);
});
