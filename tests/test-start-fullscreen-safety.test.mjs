import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("TestStartActions guards against unready tests and clears stale fullscreen on mount", async () => {
  const content = await read("app/mock-tests/[id]/TestStartActions.tsx");

  // Must exit fullscreen on mount if window is currently fullscreen (e.g. from prior navigation/aborted attempt)
  assert.match(content, /if\s*\(isCurrentlyFullscreen\(\)\)\s*\{\s*void\s*exitFullscreenSafely\(\);/);

  // Must accept isReady prop and display graceful 'Questions Being Prepared' UI when test has 0 questions
  assert.match(content, /isReady\s*=\s*true/);
  assert.match(content, /if\s*\(!isReady\s*&&\s*!resumable\)/);
  assert.match(content, /Questions Being Prepared/);
  assert.match(content, /disabled/);
});

test("start-actions.ts maps database failure exceptions to user-friendly diagnostic codes", async () => {
  const content = await read("app/mock-tests/[id]/start-actions.ts");

  // Maps specific RPC exceptions:
  // - "no active Questions" -> "no_questions"
  // - "does not match its Paper" -> "count_mismatch"
  // - "not available" -> "not_available"
  // - "access" -> "no_access"
  assert.match(content, /no active questions/i);
  assert.match(content, /errorCode\s*=\s*"no_questions"/);
  assert.match(content, /errorCode\s*=\s*"count_mismatch"/);
  assert.match(content, /errorCode\s*=\s*"not_available"/);
  assert.match(content, /errorCode\s*=\s*"no_access"/);
  assert.match(content, /redirect\(`\$\{publicPath\}\?start_error=\$\{errorCode\}`\)/);
});

test("MockTestDetailPage guards against empty tests, passes isReady, and auto-exits fullscreen on error", async () => {
  const content = await read("components/mock-tests/MockTestDetailPage.tsx");

  // 1. Imports AutoExitFullscreen
  assert.match(content, /import\s*\{\s*AutoExitFullscreen\s*\}\s*from\s*"@\/components\/feedback\/AutoExitFullscreen"/);

  // 2. Evaluates measured questions count and isTestReady
  assert.match(content, /const\s+measuredQuestionCount\s*=/);
  assert.match(content, /const\s+isTestReady\s*=\s*measuredQuestionCount\s*===\s*null\s*\?\s*true\s*:\s*measuredQuestionCount\s*>\s*0/);

  // 3. Displays 'Being prepared' when test has 0 questions
  assert.match(content, /\{isTestReady\s*\?\s*\(questionCount\s*\?\?\s*"—"\)\s*:\s*"Being prepared"\}/);

  // 4. Passes isReady to TestStartActions
  assert.match(content, /isReady=\{isTestReady\}/);

  // 5. Handles query.start_error with AutoExitFullscreen and diagnostic descriptions
  assert.match(content, /\{query\.start_error\s*&&\s*\(\s*<>\s*<AutoExitFullscreen\s*\/>/);
  assert.match(content, /query\.start_error\s*===\s*"no_questions"/);
});

test("TestNotReady in attempt page auto-exits fullscreen safely", async () => {
  const content = await read("app/mock-tests/[id]/attempt/page.tsx");

  assert.match(content, /import\s*\{\s*AutoExitFullscreen\s*\}\s*from\s*"@\/components\/feedback\/AutoExitFullscreen"/);
  assert.match(content, /function\s+TestNotReady/);
  assert.match(content, /<AutoExitFullscreen\s*\/>/);
});

test("AutoExitFullscreen component safely exits fullscreen on mount", async () => {
  const content = await read("components/feedback/AutoExitFullscreen.tsx");

  assert.match(content, /"use client"/);
  assert.match(content, /export\s+function\s+AutoExitFullscreen/);
  assert.match(content, /if\s*\(isCurrentlyFullscreen\(\)\)\s*\{\s*void\s*exitFullscreenSafely\(\);/);
});
