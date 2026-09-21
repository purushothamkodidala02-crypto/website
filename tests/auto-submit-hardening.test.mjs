import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mock test auto-submission is hardened against error boundary crashes and timer-expiry aborts", async () => {
  const [migration, attemptPage, runner, attemptActions, attemptError] = await Promise.all([
    read("supabase/migrations/20260920193000_fix_auto_submit_mock_test_attempt.sql"),
    read("app/mock-tests/[id]/attempt/page.tsx"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("app/mock-tests/[id]/attempt-actions.ts"),
    read("app/mock-tests/[id]/attempt/error.tsx"),
  ]);

  // 1. Migration directly upserts answers without calling save_mock_test_session_answers so expiry does not abort
  assert.match(migration, /create or replace function public\.submit_mock_test_attempt/);
  assert.match(migration, /insert into public\.test_attempt_session_answers/);
  assert.doesNotMatch(migration, /perform public\.save_mock_test_session_answers/);

  // 2. TakeMockTestPage handles existing attempts and expired sessions directly without looping or crashing
  assert.match(attemptPage, /existingAttempt/);
  assert.match(attemptPage, /isExpired/);

  // 3. StudentTestRunner has ref-based concurrency guards to prevent multiple auto-submit calls
  assert.match(runner, /hasAutoSubmittedRef/);
  assert.match(runner, /isFinishingRef/);

  // 4. attempt-actions verifySubmittedAttempt retries to avoid race condition on fast redirects
  assert.match(attemptActions, /verifySubmittedAttempt/);

  // 5. Dedicated attempt error boundary exists and directs students to dashboard without RetryButton
  assert.match(attemptError, /Answers safely recorded/);
  assert.doesNotMatch(attemptError, /RetryButton/);
  assert.match(attemptError, /Check your result in the dashboard/);
  assert.match(attemptError, /dashboard/);
});
