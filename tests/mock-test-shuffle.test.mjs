import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("start-actions.ts accepts shuffle parameter and forwards it via attempt URL without invalid RPC calls", () => {
  const actionsPath = path.resolve(
    process.cwd(),
    "app/mock-tests/[id]/start-actions.ts"
  );
  const code = fs.readFileSync(actionsPath, "utf-8");

  assert.match(
    code,
    /export async function beginMockTest\([\s\S]*?shuffle:\s*boolean\s*=\s*false/i,
    "beginMockTest must accept optional shuffle parameter"
  );
  // Verify it does NOT pass requested_shuffle to RPC to prevent PGRST202 failure on unmigrated databases
  assert.ok(
    !code.includes("requested_shuffle"),
    "beginMockTest must not pass unmigrated requested_shuffle parameter to RPC"
  );
  assert.match(
    code,
    /const shuffleQuery = shuffle \? "&shuffle=1" : "";/i,
    "beginMockTest must format shuffleQuery"
  );
  assert.match(
    code,
    /\$\{shuffleQuery\}/i,
    "beginMockTest must append shuffleQuery to attempt URL"
  );
});

test("Route handler /api/mock-tests/[id]/start parses shuffle parameter without invalid RPC calls", () => {
  const routePath = path.resolve(
    process.cwd(),
    "app/api/mock-tests/[id]/start/route.ts"
  );
  const code = fs.readFileSync(routePath, "utf-8");

  assert.match(
    code,
    /const shuffle\s*=\s*Boolean\(body\?\.shuffle\);/i,
    "Start route must parse shuffle from request JSON"
  );
  // Verify it does NOT pass requested_shuffle to RPC to prevent PGRST202 failure
  assert.ok(
    !code.includes("requested_shuffle"),
    "Start route must not pass unmigrated requested_shuffle to RPC"
  );
  assert.match(
    code,
    /const shuffleQuery = shuffle \? "&shuffle=1" : "";/i,
    "Start route must format shuffleQuery"
  );
  assert.match(
    code,
    /\$\{shuffleQuery\}/i,
    "Start route must append shuffleQuery to attempt URL"
  );
});

test("TakeMockTestPage safely resolves isShuffled without breaking unmigrated databases and passes it to StudentTestRunner", () => {
  const attemptPagePath = path.resolve(
    process.cwd(),
    "app/mock-tests/[id]/attempt/page.tsx"
  );
  const code = fs.readFileSync(attemptPagePath, "utf-8");

  // Verify we do NOT select is_shuffled in the direct SQL query to avoid breaking on databases where migration hasn't run yet
  assert.ok(
    !code.includes("is_shuffled"),
    "Must not query unmigrated is_shuffled column to prevent redirect to dashboard or error boundary crash"
  );
  assert.match(
    code,
    /query\.shuffle === "1" \|\| query\.shuffle === "true"/,
    "Attempt page must safely parse shuffle parameter from searchParams"
  );
  assert.match(
    code,
    /isShuffled=\{isShuffled\}/i,
    "Attempt page must pass isShuffled prop to StudentTestRunner"
  );
});

test("StudentTestRunner accepts isShuffled and renders Shuffled Mode indicator with deterministic PRNG", () => {
  const runnerPath = path.resolve(
    process.cwd(),
    "app/mock-tests/[id]/StudentTestRunner.tsx"
  );
  const code = fs.readFileSync(runnerPath, "utf-8");

  assert.match(
    code,
    /isShuffled\?:\s*boolean;/i,
    "Props type must declare isShuffled boolean"
  );
  assert.match(
    code,
    /isShuffled && \(/i,
    "StudentTestRunner must render Shuffled badge when isShuffled is true"
  );
  assert.match(
    code,
    /Shuffled Mode: Questions and options are randomized/i,
    "Shuffled badge must have descriptive accessibility title"
  );
  assert.match(
    code,
    /mulberry32/i,
    "Must implement deterministic mulberry32 PRNG"
  );
  assert.match(
    code,
    /hasRelativeOptions/i,
    "Must safeguard relative options (all of the above, none of the above, Telugu equivalents)"
  );
  assert.match(
    code,
    /originalKey/i,
    "Must map originalKey to answers to ensure 100% accurate grading"
  );
});

test("TestStartActions renders student choice toggle and dynamic retake buttons exclusively for retakes", () => {
  const actionsUiPath = path.resolve(
    process.cwd(),
    "app/mock-tests/[id]/TestStartActions.tsx"
  );
  const code = fs.readFileSync(actionsUiPath, "utf-8");

  assert.match(
    code,
    /isShuffled\s*=\s*hasAttempt\s*\?\s*\(userShuffleChoice\s*!==\s*null\s*\?\s*userShuffleChoice\s*:\s*true\)\s*:\s*false/i,
    "TestStartActions must derive isShuffled state only when hasAttempt is true"
  );
  assert.match(
    code,
    /const shuffleToggle = hasAttempt \?/i,
    "shuffleToggle must only be created and rendered when hasAttempt is true"
  );
  assert.match(
    code,
    /Shuffle Questions & Options/i,
    "TestStartActions must render Shuffle Questions & Options toggle"
  );
  assert.match(
    code,
    /Recommended/i,
    "TestStartActions must show Recommended badge for retakes"
  );
  assert.match(
    code,
    /Retake test \(Shuffled 🔀\)/i,
    "TestStartActions must render dynamic Retake test (Shuffled) label"
  );
  assert.match(
    code,
    /<span>Start test<\/span>/i,
    "New test must render standard Start test without shuffle"
  );
  assert.match(
    code,
    /shuffle:\s*shouldShuffle/i,
    "handleStartAttempt must send shuffle state in API payload"
  );
});
