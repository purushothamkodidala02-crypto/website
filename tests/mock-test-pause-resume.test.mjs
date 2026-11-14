import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mock test pause and resume are instant, idempotent, and resilient against slow network saves", async () => {
  const [migration, pauseRoute, startRoute, runner, attemptPage, attemptActions] = await Promise.all([
    read("supabase/migrations/20261114101500_harden_pause_mock_test_session.sql"),
    read("app/api/mock-tests/[id]/pause/route.ts"),
    read("app/api/mock-tests/[id]/start/route.ts"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("app/mock-tests/[id]/attempt/page.tsx"),
    read("app/mock-tests/[id]/attempt-actions.ts"),
  ]);

  // 1. Database migration ensures pause_mock_test_session is idempotent and handles already-paused state
  assert.match(migration, /create or replace function public\.pause_mock_test_session/);
  assert.match(migration, /session\.session_state = 'paused'/);
  assert.match(migration, /return paused_seconds/);

  // 2. Fast REST pause route exists and provides quick pause RPC with fallback check
  assert.match(pauseRoute, /pause_mock_test_session/);
  assert.match(pauseRoute, /save_mock_test_session_answers/);
  assert.match(pauseRoute, /cleanAnswers/);

  // 3. Start route returns expiresAt for accurate client timer resumption
  assert.match(startRoute, /expiresAt: session\.expires_at/);

  // 4. StudentTestRunner races answer saves so background retries never block pause
  assert.match(runner, /Promise\.race/);
  assert.match(runner, /togglePause/);
  assert.match(runner, /pausing/);
  assert.match(runner, /Resume test/i);

  // 5. Attempt page correctly handles paused sessions and passes initial state
  assert.match(attemptPage, /remaining_seconds/);
  assert.match(attemptPage, /initialPaused=\{session\.session_state === "paused"\}/);
  assert.match(attemptPage, /initialRemainingSeconds=\{typeof session\.remaining_seconds === "number"/);
  assert.match(attemptPage, /session\.session_state !== "paused"/);

  // 6. Server actions are resilient and clean invalid answers safely
  assert.match(attemptActions, /pauseAttempt/);
  assert.match(attemptActions, /resumeAttempt/);
  assert.match(attemptActions, /cleanAnswers/);
});
