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

test("attempt RPC calls pass requested_device_token to avoid PostgREST PGRST203 overload ambiguity and test runner omits saving indicator", async () => {
  const [runner, actions, migration] = await Promise.all([
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("app/mock-tests/[id]/attempt-actions.ts"),
    read("supabase/migrations/20261112000000_drop_ambiguous_rpc_overloads.sql"),
  ]);

  // Every RPC that has a device-token overload must pass requested_device_token explicitly
  assert.match(actions, /save_mock_test_answer_update[\s\S]*?requested_device_token:/);
  assert.match(actions, /sync_mock_test_session_timer[\s\S]*?requested_device_token:/);
  assert.match(actions, /start_mock_test_session[\s\S]*?requested_device_token:/);

  // Clean up redundant database wrapper overloads in SQL migration
  assert.match(migration, /drop function if exists public\.save_mock_test_answer_update\(uuid, uuid, text\)/);
  assert.match(migration, /drop function if exists public\.sync_mock_test_session_timer\(uuid\)/);
  assert.match(migration, /drop function if exists public\.start_mock_test_session\(uuid\)/);

  // Test runner header saves silently without showing Save failed / Saving / Saved badges
  assert.doesNotMatch(runner, /Save failed|Saving…|Saved ✓/);
});

test("logout button and header account controls stay centered and aligned across viewports", async () => {
  const [logoutBtn, accountActions, pendingSpinner] = await Promise.all([
    read("components/admin/LogoutButton.tsx"),
    read("components/site/PublicAccountActions.tsx"),
    read("components/feedback/LoadingSpinner.tsx"),
  ]);

  assert.match(logoutBtn, /inline-flex[\s\S]*?whitespace-nowrap/);
  assert.doesNotMatch(logoutBtn, /PendingButtonContent/);
  assert.match(accountActions, /min-w-0 shrink/);
  assert.doesNotMatch(pendingSpinner, /<span className="grid h-4 w-4 place-items-center">\s*\{pending/);
});
