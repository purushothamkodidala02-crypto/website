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
  assert.match(page, /Mistake Book and Bookmarks/);
  assert.match(runner, /BookmarkButton/);
  assert.match(attemptPage, /student_question_bookmarks/);
  assert.match(reviewPage, /student_question_bookmarks/);
  assert.match(reviewNavigator, /BookmarkButton/);
  assert.match(dashboard, /\/dashboard\/study-book/);
});
