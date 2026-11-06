import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("database migration defines single-device tracking for profiles and test attempt sessions", async () => {
  const migration = await read("supabase/migrations/20261107020000_single_device_enforcement.sql");

  assert.match(migration, /active_session_token text/);
  assert.match(migration, /active_device_token text/);
  assert.match(migration, /check_mock_test_device_status/);
  assert.match(migration, /SESSION_DISPLACED/);
  assert.match(migration, /start_mock_test_session/);
});

test("site-wide single device login registers tokens across password, OTP, and OAuth sign-in flows", async () => {
  const [passwordLogin, emailOtpCallback, oauthCallback, sessionModule] = await Promise.all([
    read("app/login/actions.ts"),
    read("app/auth/email-otp/callback/route.ts"),
    read("app/auth/oauth/callback/route.ts"),
    read("lib/auth/single-session.ts"),
  ]);

  assert.match(passwordLogin, /registerActiveSessionToken/);
  assert.match(emailOtpCallback, /active_session_token/);
  assert.match(oauthCallback, /registerActiveSessionToken/);
  assert.match(sessionModule, /SINGLE_SESSION_COOKIE_NAME/);
  assert.match(sessionModule, /verifyActiveSession/);
});

test("proxy middleware allows exam attempt routes to refresh authentication cookies", async () => {
  const proxy = await read("proxy.ts");

  assert.match(proxy, /isExamAttemptRoute = request\.nextUrl\.pathname\.includes\("\/attempt"\)/);
  assert.match(proxy, /!isExamAttemptRoute/);
});

test("student test runner detects another device and closes PC session with automatic logout", async () => {
  const [runner, actions, startActions] = await Promise.all([
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("app/mock-tests/[id]/attempt-actions.ts"),
    read("app/mock-tests/[id]/start-actions.ts"),
  ]);

  // Runner has displacement handling, device heartbeat, and signOut
  assert.match(runner, /handleDisplaced/);
  assert.match(runner, /checkAttemptDeviceStatus/);
  assert.match(runner, /supabase\.auth\.signOut\(\)/);
  assert.match(runner, /Test Resumed on Another Device/);

  // Actions check and return displaced status
  assert.match(actions, /checkAttemptDeviceStatus/);
  assert.match(actions, /displaced:\s*true/);

  // Start actions record active device token
  assert.match(startActions, /active_device_token/);
});
