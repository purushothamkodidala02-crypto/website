import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("lib/exam-syllabus.ts exports computeExamSyllabus, parseGovernmentSyllabus and types", async () => {
  const file = await read("lib/exam-syllabus.ts");

  assert.match(file, /export function computeExamSyllabus/);
  assert.match(file, /export function parseGovernmentSyllabus/);
  assert.match(file, /export type ComputedSyllabus/);
  assert.match(file, /export type ComputedPaper/);
  assert.match(file, /export type ComputedUnit/);
  assert.match(file, /export type ComputedExamPattern/);

  // Verifies default official government syllabi are present
  assert.match(file, /DEFAULT_APPSC_GENERAL_STUDIES_SYLLABUS/);
  assert.match(file, /DEFAULT_TELANGANA_POLICE_SYLLABUS/);
  assert.match(file, /DEFAULT_ENDOWMENT_PAPER2_SYLLABUS/);

  // Verifies parsing logic handles numbered items like "01 .", "02 .", "10 ."
  assert.match(file, /deriveSubjectTitle/);
  assert.match(file, /extractFocusTopics/);

  // Verifies automatic question, marks, and duration accumulation
  assert.match(file, /sumQuestions \+= qCount/);
  assert.match(file, /sumMarks \+= calcMarks/);
  assert.match(file, /sumDuration \+= durMins/);

  // Verifies negative marking calculation
  assert.match(file, /summarizeExamNegativeMarking\(activePapers\)/);

  // Verifies unit generation
  assert.match(file, /unitNumber: `Unit \$\{String\(unitIndex\)\.padStart\(2, "0"\)\}`/);
});

test("app/mock-tests/[id]/[exam]/syllabus/page.tsx utilizes computeExamSyllabus and graceful fallbacks", async () => {
  const syllabusPage = await read("app/mock-tests/[id]/[exam]/syllabus/page.tsx");

  assert.match(syllabusPage, /computeExamSyllabus/);
  assert.match(syllabusPage, /syllabus\.hasCurriculum/);
  assert.match(syllabusPage, /syllabus\.pattern\.authority/);
  assert.match(syllabusPage, /syllabus\.pattern\.totalQuestions/);
  assert.match(syllabusPage, /syllabus\.pattern\.totalMarks/);
  assert.match(syllabusPage, /syllabus\.pattern\.durationMinutes/);
  assert.match(syllabusPage, /syllabus\.pattern\.negativeMarking/);
  assert.match(syllabusPage, /syllabus\.units\.map/);
  assert.match(syllabusPage, /syllabus\.papers\.map/);

  // Dedicated bottom CTA for mock tests rather than cluttered preview cards beside units
  assert.match(syllabusPage, /Ready to Practice for/);
  assert.match(syllabusPage, /Explore.*Mock Tests/);

  // Graceful fallback when no papers/subjects exist yet
  assert.match(syllabusPage, /Official 2026 Notification &amp; Syllabus in Preparation/);
  assert.match(syllabusPage, /Browse Available/);
});

test("exam landing page automatically displays pattern and syllabus overview for all exams", async () => {
  const examPage = await read("app/mock-tests/[id]/[exam]/page.tsx");

  assert.match(examPage, /computeExamSyllabus/);
  assert.match(examPage, /syllabus\.hasCurriculum/);
  assert.match(examPage, /syllabus\.pattern\.authority/);
  assert.match(examPage, /syllabus\.units\.slice\(0, 6\)/);
});

test("admin subjects page clarifies automatic syllabus generation", async () => {
  const adminSubjects = await read("app/admin/subjects/page.tsx");

  assert.match(adminSubjects, /Subjects &amp; Syllabus Curriculum/);
  assert.match(adminSubjects, /How Syllabus is generated automatically/);
});

test("admin exam-pages allows updating official government notification syllabus with templates", async () => {
  const actionsFile = await read("app/admin/exam-pages/actions.ts");
  const managerFile = await read("app/admin/exam-pages/ExamPageFaqManager.tsx");

  assert.match(actionsFile, /updateExamPageSyllabus/);
  assert.match(actionsFile, /SYLLABUS_FAQ_KEY/);

  assert.match(managerFile, /ExamPageSyllabusForm/);
  assert.match(managerFile, /Official Government Notification/);
  assert.match(managerFile, /Official Government Syllabus Units/);
  assert.match(managerFile, /APPSC 10-Unit/);
  assert.match(managerFile, /TGPRB Police/);
});

test("student-side mock-tests page has mobile-optimized horizontal touch scrolling for subjects", async () => {
  const mockTestsPage = await read("app/mock-tests/page.tsx");

  // Touch scrolling and comfortable tap targets for subjects on mobile
  assert.match(mockTestsPage, /overflow-x-auto/);
  assert.match(mockTestsPage, /touch-pan-x/);
  assert.match(mockTestsPage, /min-h-\[42px\]/);
  assert.match(mockTestsPage, /grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/);
});

test("exam and syllabus pages display curriculum topics cleanly without test preview clutter", async () => {
  const examPage = await read("app/mock-tests/[id]/[exam]/page.tsx");
  const syllabusPage = await read("app/mock-tests/[id]/[exam]/syllabus/page.tsx");

  assert.match(examPage, /Subject-wise Syllabus Topics/);
  assert.match(syllabusPage, /Subject-Wise Syllabus &amp; Topic Units/);
  assert.match(syllabusPage, /grid-cols-1 md:grid-cols-2/);
  assert.doesNotMatch(syllabusPage, /Practise tests →/);
});
