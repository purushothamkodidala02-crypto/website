import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("lib/exam-syllabus.ts exports computeExamSyllabus and types", async () => {
  const file = await read("lib/exam-syllabus.ts");

  assert.match(file, /export function computeExamSyllabus/);
  assert.match(file, /export type ComputedSyllabus/);
  assert.match(file, /export type ComputedPaper/);
  assert.match(file, /export type ComputedUnit/);
  assert.match(file, /export type ComputedExamPattern/);

  // Verifies automatic question, marks, and duration accumulation
  assert.match(file, /sumQuestions \+= qCount/);
  assert.match(file, /sumMarks \+= calcMarks/);
  assert.match(file, /sumDuration \+= durMins/);

  // Verifies negative marking calculation
  assert.match(file, /summarizeExamNegativeMarking\(activePapers\)/);

  // Verifies unit generation
  assert.match(file, /unitNumber: `Unit \$\{String\(unitIndex\)\.padStart\(2, "0"\)\}`/);
});

test("dedicated syllabus page route is deleted and redirected cleanly in next.config.ts", async () => {
  const nextConfig = await read("next.config.ts");

  // Route file must not exist
  let routeExists = false;
  try {
    await access(new URL("../app/mock-tests/[id]/[exam]/syllabus/page.tsx", import.meta.url));
    routeExists = true;
  } catch {
    routeExists = false;
  }
  assert.equal(routeExists, false);

  // next.config.ts redirects /syllabus requests back to the exam page
  assert.match(nextConfig, /source:\s*"\/mock-tests\/:state\/:exam\/syllabus"/);
  assert.match(nextConfig, /destination:\s*"\/mock-tests\/:state\/:exam"/);
});

test("exam landing page does not render auto-generated syllabus units or links to /syllabus", async () => {
  const examPage = await read("app/mock-tests/[id]/[exam]/page.tsx");

  assert.doesNotMatch(examPage, /syllabusUrl/);
  assert.doesNotMatch(examPage, /computeExamSyllabus/);
  assert.doesNotMatch(examPage, /View Official Syllabus/);
  assert.doesNotMatch(examPage, /Full.*Syllabus Guide/);
  assert.doesNotMatch(examPage, /Subject-wise Syllabus Coverage/);
});

test("admin subjects page clarifies automatic syllabus generation", async () => {
  const adminSubjects = await read("app/admin/subjects/page.tsx");

  assert.match(adminSubjects, /Subjects &amp; Syllabus Curriculum/);
  assert.match(adminSubjects, /How Syllabus is generated automatically/);
});

test("student-side mock-tests page has mobile-optimized horizontal touch scrolling for subjects", async () => {
  const mockTestsPage = await read("app/mock-tests/page.tsx");

  // Touch scrolling and comfortable tap targets for subjects on mobile
  assert.match(mockTestsPage, /overflow-x-auto/);
  assert.match(mockTestsPage, /touch-pan-x/);
  assert.match(mockTestsPage, /min-h-\[42px\]/);
  assert.match(mockTestsPage, /grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/);

  // Syllabus links removed from student-side catalogue cards
  assert.doesNotMatch(mockTestsPage, /Syllabus &amp; Pattern/);
});

test("AP Endowment Officer does not show 286 questions or syllabus cards", async () => {
  const [examPage, teluguSeo] = await Promise.all([
    read("app/mock-tests/[id]/[exam]/page.tsx"),
    read("lib/telugu-seo.ts"),
  ]);

  // AP EO has no custom pattern in teluguData
  assert.doesNotMatch(teluguSeo, /"endowment-officer":\s*\{[\s\S]*?pattern:\s*\{/);

  // No 286 anywhere on the exam page
  assert.doesNotMatch(examPage, /286/);
});
