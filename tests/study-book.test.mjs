import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("student bookmarks and mistakes are private, automatic, and accessible", async () => {
  const [migration, action, button, page, runner, attemptPage, reviewPage, reviewNavigator, dashboard] = await Promise.all([
    read("supabase/migrations/20260825203000_add_student_study_book.sql"),
    read("lib/actions/question-bookmarks.ts"),
    read("components/study/BookmarkButton.tsx"),
    read("app/dashboard/study-book/page.tsx"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("app/mock-tests/[id]/attempt/page.tsx"),
    read("app/dashboard/attempts/[id]/page.tsx"),
    read("app/dashboard/attempts/[id]/AttemptReviewNavigator.tsx"),
    read("app/dashboard/page.tsx"),
  ]);

  assert.match(migration, /create table if not exists public\.student_question_bookmarks/);
  assert.match(migration, /create table if not exists public\.student_question_mistakes/);
  assert.match(migration, /after insert on public\.attempt_responses/);
  assert.match(migration, /mastered_at = attempt_time/);
  assert.match(migration, /user_id = auth\.uid\(\)/);
  assert.match(migration, /security definer/);
  assert.match(action, /auth\.getUser\(\)/);
  assert.match(action, /UUID_PATTERN/);
  assert.match(button, /aria-pressed=\{bookmarked\}/);
  assert.match(button, /disabled=\{pending\}/);
  assert.match(button, /min-w-0[\s\S]*sm:min-w-32/);
  assert.match(button, /whitespace-nowrap/);
  assert.match(page, /Mistake Book and Bookmarks/);
  assert.match(runner, /BookmarkButton/);
  assert.match(attemptPage, /student_question_bookmarks/);
  assert.match(reviewPage, /student_question_bookmarks/);
  assert.match(reviewNavigator, /BookmarkButton/);
  assert.match(reviewNavigator, /flex-1 sm:flex-initial/);
  assert.match(dashboard, /\/dashboard\/study-book/);
});

test("study viewer keys report and bookmark controls per question and keeps mobile toolbar uncluttered", async () => {
  const [studyViewer, reportButton] = await Promise.all([
    read("components/study/StudyViewer.tsx"),
    read("components/questions/ReportQuestionButton.tsx"),
  ]);

  assert.match(studyViewer, /ReportQuestionButton key=\{`report-\$\{currentRow\.question_id\}`\}/);
  assert.match(studyViewer, /BookmarkButton key=\{currentRow\.question_id\}/);
  assert.match(studyViewer, /hidden sm:inline-flex[\s\S]*aria-label="Question language"/);
  assert.match(reportButton, /whitespace-nowrap/);
});

test("student_question_mistakes foreign key cascades on question delete", async () => {
  const cascadeMigration = await read("supabase/migrations/20261112224500_cascade_student_question_mistakes.sql");
  assert.match(cascadeMigration, /student_question_mistakes_question_id_fkey/);
  assert.match(cascadeMigration, /on delete cascade/i);
});
