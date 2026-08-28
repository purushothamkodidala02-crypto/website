import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Google login uses the branded Google button and preserves the requested destination", async () => {
  const [button, callback, completion, login, register] = await Promise.all([
    read("components/auth/GoogleSignInButton.tsx"),
    read("app/auth/oauth/callback/route.ts"),
    read("app/auth/session/complete/route.ts"),
    read("app/login/LoginForm.tsx"),
    read("app/register/RegisterForm.tsx"),
  ]);

  assert.match(button, /accounts\.google\.com\/gsi\/client/);
  assert.match(button, /signInWithIdToken/);
  assert.match(button, /useRouter/);
  assert.match(button, /router\.replace\(`\/auth\/session\/complete/);
  assert.doesNotMatch(button, /window\.location\.assign/);
  assert.match(button, /createGoogleNonce/);
  assert.match(button, /nonce: nonceRef\.current/);
  assert.match(button, /use_fedcm_for_button: true/);
  assert.match(button, /\/auth\/session\/complete/);
  assert.match(button, /text: "continue_with"/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /value\?\.startsWith\("\/"\) && !value\.startsWith\("\/\/"\)/);
  assert.match(completion, /profile\.role === "admin"/);
  assert.match(completion, /if \(!profile\.phone\)/);
  assert.match(completion, /signOut\(\{ scope: "others" \}\)/);
  assert.match(login, /GoogleSignInButton/);
  assert.match(register, /GoogleSignInButton/);
});

test("new social-login students complete a verified mobile profile before continuing", async () => {
  const [completion, page, form, action] = await Promise.all([
    read("app/auth/session/complete/route.ts"),
    read("app/complete-profile/page.tsx"),
    read("app/complete-profile/CompleteProfileForm.tsx"),
    read("app/complete-profile/actions.ts"),
  ]);

  assert.match(completion, /if \(!profile\.phone\)/);
  assert.match(completion, /\/complete-profile/);
  assert.match(page, /Google securely confirmed your name and email/);
  assert.match(form, /autoComplete="tel-national"/);
  assert.match(action, /normaliseIndianMobile/);
  assert.match(action, /supabase\.auth\.getUser\(\)/);
  assert.match(action, /profile\.role !== "student"/);
  assert.match(action, /updateUserById/);
  assert.match(action, /\.update\(\{ full_name: fullName, phone \}\)/);
});

test("student sign-ins close sessions on other devices while administrators keep MFA sessions", async () => {
  const [passwordLogin, emailCodeCallback, oauthCallback] = await Promise.all([
    read("app/login/actions.ts"),
    read("app/auth/email-otp/callback/route.ts"),
    read("app/auth/oauth/callback/route.ts"),
  ]);

  assert.match(passwordLogin, /profile\.role !== "admin"/);
  assert.match(passwordLogin, /signOut\(\{ scope: "others" \}\)/);
  assert.match(emailCodeCallback, /profile\?\.role === "student"/);
  assert.match(emailCodeCallback, /signOut\(\{ scope: "others" \}\)/);
  assert.match(oauthCallback, /signOut\(\{ scope: "others" \}\)/);
});
