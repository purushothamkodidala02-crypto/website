import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("submitted mock test does not return to active test runner on back navigation", async () => {
  const runner = await read("app/mock-tests/[id]/StudentTestRunner.tsx");

  // 1. Persists submitted session result in sessionStorage and restores synchronously before paint
  assert.match(runner, /varadhi_submitted_session_/);
  assert.match(runner, /persistSubmittedSession/);
  assert.match(runner, /restoreSubmittedSessionFromStorage/);
  assert.match(runner, /useLayoutEffect/);

  // 2. Invalidates Next.js client Router Cache after submission and handles bfcache pageshow
  assert.match(runner, /router\.refresh\(\)/);
  assert.match(runner, /pageshow/);

  // 3. Heartbeat also detects already-submitted sessions and transitions to SubmissionResult
  assert.match(runner, /session\.session_state === "submitted"\s*\|\|\s*session\.submitted_at/);
});
