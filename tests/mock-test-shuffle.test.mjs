import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Database migration creates is_shuffled column and unified shuffle RPCs", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261117120000_add_mock_test_shuffle_feature.sql"
  );
  assert.ok(fs.existsSync(migrationPath), "Migration file must exist");

  const sql = fs.readFileSync(migrationPath, "utf-8");

  // Check column addition
  assert.match(
    sql,
    /add column if not exists is_shuffled boolean not null default false/i,
    "Must add is_shuffled column to test_attempt_sessions"
  );

  // Check dropping ambiguous overloads
  assert.match(
    sql,
    /drop function if exists public\.start_mock_test_session\(uuid, text\);/i,
    "Must drop previous 2-arg start overload to prevent PGRST203 ambiguity"
  );
  assert.match(
    sql,
    /drop function if exists public\.restart_mock_test_session\(uuid, text\);/i,
    "Must drop previous 2-arg restart overload to prevent PGRST203 ambiguity"
  );

  // Check function signature with requested_shuffle default false
  assert.match(
    sql,
    /create or replace function public\.start_mock_test_session\(\s*requested_mock_test_id uuid,\s*requested_device_token text default null,\s*requested_shuffle boolean default false\s*\)/i,
    "start_mock_test_session must accept requested_shuffle boolean default false"
  );
  assert.match(
    sql,
    /create or replace function public\.restart_mock_test_session\(\s*requested_mock_test_id uuid,\s*requested_device_token text default null,\s*requested_shuffle boolean default false\s*\)/i,
    "restart_mock_test_session must accept requested_shuffle boolean default false"
  );

  // Check options permutation and Telugu synchronization
  assert.match(
    sql,
    /opts_en := array\[q_rec\.option_a, q_rec\.option_b, q_rec\.option_c, q_rec\.option_d\];/i,
    "Must collect English options into array"
  );
  assert.match(
    sql,
    /opts_te := array\[q_rec\.option_a_te, q_rec\.option_b_te, q_rec\.option_c_te, q_rec\.option_d_te\];/i,
    "Must collect Telugu options into array"
  );
  assert.match(
    sql,
    /final_correct :=/i,
    "Must re-map correct answer to randomized option position"
  );

  // Check safeguard for relative options
  assert.match(
    sql,
    /has_relative_options :=/i,
    "Must check for relative options (e.g. all of the above, none of the above, Telugu equivalents)"
  );
  assert.match(
    sql,
    /notify pgrst, 'reload schema';/i,
    "Must notify PostgREST to reload schema"
  );
});

test("start-actions.ts accepts shuffle parameter and forwards to database RPC", () => {
  const actionsPath = path.resolve(
    process.cwd(),
    "app/mock-tests/[id]/start-actions.ts"
  );
  const code = fs.readFileSync(actionsPath, "utf-8");

  assert.match(
    code,
    /export async function beginMockTest\([\s\S]*?shuffle:\s*boolean\s*=\s*false/i,
    "beginMockTest must accept shuffle parameter"
  );
  assert.match(
    code,
    /requested_shuffle:\s*shuffle/i,
    "beginMockTest must pass requested_shuffle in RPC arguments"
  );
});

test("Route handler /api/mock-tests/[id]/start parses shuffle parameter", () => {
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
  assert.match(
    code,
    /requested_shuffle:\s*shuffle/i,
    "Start route must pass requested_shuffle to RPC"
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
    !code.includes('.select("id, user_id, expires_at, session_state, submitted_at, remaining_seconds, is_shuffled")'),
    "Must not blindly query unmigrated is_shuffled column to prevent redirect to dashboard error"
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

test("StudentTestRunner accepts isShuffled and renders Shuffled Mode indicator", () => {
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
});

test("TestStartActions renders Option 1 student choice toggle and dynamic retake buttons", () => {
  const actionsUiPath = path.resolve(
    process.cwd(),
    "app/mock-tests/[id]/TestStartActions.tsx"
  );
  const code = fs.readFileSync(actionsUiPath, "utf-8");

  assert.match(
    code,
    /isShuffled\s*=\s*userShuffleChoice\s*!==\s*null\s*\?\s*userShuffleChoice\s*:\s*hasAttempt/i,
    "TestStartActions must derive isShuffled state"
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
    /shuffle:\s*shouldShuffle/i,
    "handleStartAttempt must send shuffle state in API payload"
  );
  assert.match(
    code,
    /requested_shuffle:\s*shouldShuffle/i,
    "handleStartAttempt client RPC must include requested_shuffle"
  );
});
