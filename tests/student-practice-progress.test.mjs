import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("student practice storage provides robust local helpers for recent practice and attempts", async () => {
  const storage = await read("lib/storage/student-practice-storage.ts");

  assert.match(storage, /export function getLocalRecentPractice/);
  assert.match(storage, /export function setLocalRecentPractice/);
  assert.match(storage, /export function getLocalAttemptedTestIds/);
  assert.match(storage, /export function addLocalAttemptedTestId/);
  assert.match(storage, /export function subscribePracticeUpdates/);
});

test("practice status server action queries student attempts and resolves public folder context", async () => {
  const action = await read("app/actions/practice-status.ts");

  assert.match(action, /export async function getStudentPracticeStatus/);
  assert.match(action, /\.from\("test_attempts"\)/);
  assert.match(action, /getMockTestPublicContextById/);
  assert.match(action, /folderUrl/);
  assert.match(action, /subjectUrl/);
  assert.match(action, /paperUrl/);
});

test("mock test card action distinguishes between written (Retake) and unwritten (Start test) papers", async () => {
  const cardAction = await read("components/mock-tests/MockTestCardAction.tsx");

  assert.match(cardAction, /useStudentPractice/);
  assert.match(cardAction, />\s*Retake\s*</);
  assert.match(cardAction, />\s*Start test\s*</);
  assert.match(cardAction, /Attempted/);
  assert.match(cardAction, /shrink-0/);
});

test("student resume practice banner routes directly to folder where student last practiced", async () => {
  const banner = await read("components/site/StudentResumePracticeBanner.tsx");

  assert.match(banner, /useStudentPractice/);
  assert.match(banner, /lastPractice\.folderUrl/);
  assert.match(banner, /Continue to \{lastPractice\.folderName\}/);
  assert.match(banner, /Retake test/);
});

test("home, catalogue, and exam pages render resume practice progress and responsive card actions", async () => {
  const [home, mockTests, runner, details, examPage] = await Promise.all([
    read("app/page.tsx"),
    read("app/mock-tests/page.tsx"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("components/mock-tests/MockTestDetailPage.tsx"),
    read("app/mock-tests/[id]/[exam]/page.tsx"),
  ]);

  assert.match(home, /StudentResumePracticeBanner/);
  assert.match(mockTests, /StudentResumePracticeBanner/);
  assert.match(mockTests, /MockTestCardAction/);
  assert.match(runner, /setLocalRecentPractice/);
  assert.match(details, /hasPreviousAttempt=\{hasPreviousAttempt\}/);
  assert.match(examPage, /MockTestCardAction/);
  assert.match(examPage, /grid-cols-1 md:grid-cols-2/);
  assert.match(examPage, /overflow-hidden/);
});
