import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("question reporting is private, rate-limited, and connected from students to admins", async () => {
  const [migration, studentAction, studentButton, runner, studyBook, review, adminPage, adminAction, adminForm, navigation, overview] = await Promise.all([
    read("supabase/migrations/20260825220000_add_question_reporting.sql"),
    read("lib/actions/question-reports.ts"),
    read("components/questions/ReportQuestionButton.tsx"),
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
  assert.match(studentButton, /role="dialog"/);
  assert.match(studentButton, /aria-busy=\{pending\}/);
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
