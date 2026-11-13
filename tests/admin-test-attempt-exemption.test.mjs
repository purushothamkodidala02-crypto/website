import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("kodidalanani@gmail.com is configured as an exempt admin account", async () => {
  const exemptions = await read("lib/admin-mock-test-exemptions.ts");

  assert.match(exemptions, /EXEMPT_ADMIN_EMAILS = \["kodidalanani@gmail\.com"\]/);
  assert.match(exemptions, /isExemptAdminEmail/);
  assert.match(exemptions, /getAdminAttemptCountsByMockTestId/);
  assert.match(exemptions, /mockTestHasStudentAttempts/);
  assert.match(exemptions, /clearAdminTestAttempts/);
});

test("database migration defines mock_test_has_student_attempts exempting kodidalanani@gmail.com", async () => {
  const migration = await read("supabase/migrations/20260923170000_allow_admin_mock_test_edit_for_admin_attempts.sql");

  assert.match(migration, /create or replace function public\.mock_test_has_student_attempts/);
  assert.match(migration, /kodidalanani@gmail\.com/);
  assert.match(migration, /guard_mock_test_question_mutation/);
  assert.match(migration, /guard_mock_test_target_change/);
  assert.match(migration, /replace_mock_test_questions_atomic/);
  assert.match(migration, /fill_mock_test_with_latest_questions/);
  assert.match(migration, /get_admin_mock_test_summaries/);
});

test("admin mock test management UI wires admin attempt exemption and clear attempt action", async () => {
  const [buttons, table, page, actions, questionActions, importActions] = await Promise.all([
    read("app/admin/mock-tests/MockTestManagementButtons.tsx"),
    read("app/admin/mock-tests/ExistingMockTestsTable.tsx"),
    read("app/admin/mock-tests/page.tsx"),
    read("app/admin/mock-tests/manage-actions.ts"),
    read("app/admin/mock-tests/[id]/edit/question-actions.ts"),
    read("app/admin/questions/import-actions.ts"),
  ]);

  // MockTestManagementButtons supports adminAttemptCount and clearing attempts
  assert.match(buttons, /adminAttemptCount/);
  assert.match(buttons, /clear-admin-attempts/);
  assert.match(buttons, /clearAdminBtn/);
  assert.match(buttons, /Clear my attempt/);
  assert.match(buttons, /clear-all-attempts/);
  assert.match(buttons, /clearAllAttemptsBtn/);
  assert.match(buttons, /Clear attempts & restore draft/);

  // ExistingMockTestsTable displays admin test info and passes count
  assert.match(table, /adminAttemptCount/);
  assert.match(table, /admin test/);

  // page.tsx integrates exemptions without violating prelaunch tests
  assert.match(page, /getAdminAttemptCountsByMockTestId/);
  assert.match(page, /attemptExemptions/);
  assert.doesNotMatch(page, /from\("test_attempts"\)/);
  assert.doesNotMatch(page, /from\("mock_test_questions"\)/);

  // manage-actions.ts handles admin attempt cleanup on draft deletion and exports clear action
  assert.match(actions, /clearAdminTestAttempts/);
  assert.match(actions, /clearAdminMockTestAttemptsAction/);
  assert.match(actions, /clearAllMockTestAttemptsAction/);
  assert.match(actions, /mockTestHasStudentAttempts/);

  // question-actions.ts and import-actions.ts use mockTestHasStudentAttempts
  assert.match(questionActions, /mockTestHasStudentAttempts/);
  assert.match(importActions, /mockTestHasStudentAttempts/);
});
