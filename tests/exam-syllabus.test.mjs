import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseGovernmentSyllabus, computeExamSyllabus } from "../lib/exam-syllabus.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("lib/exam-syllabus.ts exports computeExamSyllabus, parseGovernmentSyllabus and types", async () => {
  const file = await read("lib/exam-syllabus.ts");

  assert.match(file, /export function computeExamSyllabus/);
  assert.match(file, /export function parseGovernmentSyllabus/);
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

test("parseGovernmentSyllabus correctly parses official government numbered notification formats", () => {
  const rawGovSyllabus = `
Major Current Events and Issues pertaining to International,
National and State of Andhra Pradesh.
02 . General Science and its applications to the day to day life
Contemporary developments in Science & Technology and
Information Technology.
03 . History of India – emphasis will be on broad general
understanding of the subject in its social, economic, cultural
and political aspects with a focus on AP and Indian National
Movement.
04 . Geography of India with focus on Andhra Pradesh.
05 . Indian polity and Governance: constitutional issues, public
policy, reforms and e-Governance initiatives.
06 . Indian Economy and planning
07 . Sustainable Development and Environmental Protection
08 . Disaster management: vulnerability profile, prevention and
mitigation strategies, Application of Remote Sensing and
GIS in the assessment of Disaster
09 . Logical reasoning, analytical ability and logical interpretation.
10 . Data Analysis: Tabulation of data Visual representation of
data Basic data analysis (Summary Statistics such as mean,
median, mode and variance)and Interpretation.
`;

  const parsed = parseGovernmentSyllabus(rawGovSyllabus);
  assert.equal(parsed.length, 10, "Should have parsed exactly 10 units");

  assert.equal(parsed[0].unitNumber, "Unit 01");
  assert.equal(parsed[0].name, "Current Affairs & Regional Events");
  assert.match(parsed[0].description, /Major Current Events and Issues/);

  assert.equal(parsed[1].unitNumber, "Unit 02");
  assert.equal(parsed[1].name, "General Science & Technology");
  assert.match(parsed[1].description, /Contemporary developments in Science & Technology/);

  assert.equal(parsed[9].unitNumber, "Unit 10");
  assert.equal(parsed[9].name, "Data Analysis & Interpretation");
  assert.ok(parsed[9].topics.length > 0);

  // Test integration with computeExamSyllabus
  const computed = computeExamSyllabus({
    examName: "APPSC Group 2 Notification",
    stateName: "Andhra Pradesh",
    stateCode: "AP",
    boardName: "APPSC",
    papers: [],
    subjects: [],
    sections: [],
    tests: [],
    customSyllabusText: rawGovSyllabus,
  });

  assert.equal(computed.units.length, 10);
  assert.equal(computed.units[0].unitNumber, "Unit 01");
  assert.equal(computed.units[9].unitNumber, "Unit 10");
  assert.equal(computed.hasCurriculum, true);
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
  assert.match(syllabusPage, /Explore Mock Tests/);

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
  assert.match(actionsFile, /__OFFICIAL_GOVERNMENT_SYLLABUS__/);

  assert.match(managerFile, /ExamPageSyllabusForm/);
  assert.match(managerFile, /Official Government Notification Syllabus/);
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
