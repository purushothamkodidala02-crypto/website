import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("question reporting is private, rate-limited, and connected from students to admins", async () => {
  const [migration, studentAction, studentButton, studentDialog, runner, studyBook, review, adminPage, adminAction, adminForm, navigation, overview] = await Promise.all([
    read("supabase/migrations/20260825220000_add_question_reporting.sql"),
    read("lib/actions/question-reports.ts"),
    read("components/questions/ReportQuestionButton.tsx"),
    read("components/questions/ReportQuestionDialog.tsx"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("app/dashboard/study-book/page.tsx"),
    read("app/dashboard/attempts/[id]/AttemptReviewNavigator.tsx"),
    read("app/admin/question-reports/page.tsx"),
    read("app/admin/question-reports/actions.ts"),
    read("app/admin/question-reports/ReportAdminForm.tsx"),
    read("components/admin/AdminNavigation.tsx"),
    read("app/admin/page.tsx"),
  ]);

  assert.match(migration, /create table if not exists public\.question_reports/);
  assert.match(migration, /user_id = auth\.uid\(\)/);
  assert.match(migration, /Admins manage question reports/);
  assert.match(migration, /uq_question_reports_open_student_category/);
  assert.match(studentAction, /auth\.getUser\(\)/);
  assert.match(studentAction, /\(count \?\? 0\) >= 10/);
  assert.match(studentAction, /error\?\.code === "23505"/);
  assert.match(studentDialog, /role="dialog"/);
  assert.match(studentDialog, /aria-busy=\{pending\}/);
  assert.match(runner, /ReportQuestionButton/);
  assert.match(studyBook, /ReportQuestionButton/);
  assert.match(review, /attemptId=\{attemptId\}/);
  assert.match(adminPage, /Question reports/);
  assert.match(adminPage, /Open question/);
  assert.match(adminAction, /currentLevel !== "aal2"/);
  assert.match(adminForm, /useActionState/);
  assert.match(navigation, /Question reports/);
  assert.match(overview, /Student question reports are open/);
});

test("optional catalogue statistics cannot hide the public mock-test library", async () => {
  const catalog = await read("lib/catalog-data.ts");
  assert.match(catalog, /mock-test-catalog-v4/);
  const coreError = catalog.slice(catalog.indexOf("hasError:"), catalog.indexOf("hasSupplementaryError:"));
  assert.doesNotMatch(coreError, /statsResult\.error/);
  assert.doesNotMatch(coreError, /specializationsResult\.error/);
  assert.match(catalog, /hasSupplementaryError: Boolean\(specializationsResult\.error \|\| statsResult\.error\)/);
});

test("registrations fetch only visible student emails through an admin-only database function", async () => {
  const [migration, page] = await Promise.all([
    read("supabase/migrations/20260825223000_optimize_admin_registration_emails.sql"),
    read("app/admin/students/page.tsx"),
  ]);
  assert.match(migration, /not public\.is_admin\(\)/);
  assert.match(migration, /array_length\(requested_user_ids/);
  assert.match(migration, /from auth\.users/);
  assert.match(page, /get_admin_user_emails/);
  assert.doesNotMatch(page, /admin\.auth\.admin\.listUsers/);
});
