import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin mock test preview page has resilient fallback if image_url_te is missing from DB", async () => {
  const content = await read("app/admin/mock-tests/[id]/preview/page.tsx");

  assert.match(content, /image_url_te/);
  assert.match(content, /fallback/);
  assert.match(content, /42703/);
});

test("admin question edit pages and actions have resilient fallback if image_url_te is missing from DB", async () => {
  const editPage = await read("app/admin/questions/[id]/edit/page.tsx");
  assert.match(editPage, /fetchQuestion/);
  assert.match(editPage, /42703/);

  const mockTestQuestionEditPage = await read("app/admin/mock-tests/[id]/questions/[questionId]/edit/page.tsx");
  assert.match(mockTestQuestionEditPage, /fetchQuestion/);
  assert.match(mockTestQuestionEditPage, /42703/);

  const editActions = await read("app/admin/questions/[id]/edit/actions.ts");
  assert.match(editActions, /fetchExistingQuestion/);
  assert.match(editActions, /payloadWithoutTe/);

  const createActions = await read("app/admin/questions/actions.ts");
  assert.match(createActions, /payloadWithoutTe/);
  assert.match(createActions, /42703/);
});

test("student attempts and study book have resilient fallback if image_url_te is missing", async () => {
  const attemptPage = await read("app/dashboard/attempts/[id]/page.tsx");
  assert.match(attemptPage, /fetchMockQuestions/);
  assert.match(attemptPage, /42703/);

  const studyBookPage = await read("app/dashboard/study-book/page.tsx");
  assert.match(studyBookPage, /42703/);
});
