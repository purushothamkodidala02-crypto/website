import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Telangana Police Constable mock test series has optimized SEO meta tags matching the report", async () => {
  const guidesLib = await read("lib/exam-guides.ts");

  // Title: 55 chars
  assert.match(guidesLib, /seoTitle:\s*"Telangana Police Constable Mock Test Series 2026 \| Free"/);
  const titleMatch = guidesLib.match(/seoTitle:\s*"([^"]+)"/);
  assert.ok(titleMatch);
  assert.equal(titleMatch[1].length, 55);

  // Meta description: 162 chars
  assert.match(
    guidesLib,
    /Practice the latest Telangana Police Constable Mock Test 2026 for free\. Get bilingual questions, detailed solutions, and instant performance analytics\. Start now!/
  );
  const descMatch = guidesLib.match(/seoDescription:\s*"([^"]+)"/);
  assert.ok(descMatch);
  assert.equal(descMatch[1].length, 162);
});

test("Telangana Police Constable mock test series adheres to the required heading hierarchy", async () => {
  const [guideComponent, examRoute, guidesLib] = await Promise.all([
    read("components/exams/ExamLandingGuide.tsx"),
    read("app/mock-tests/[id]/[exam]/page.tsx"),
    read("lib/exam-guides.ts"),
  ]);

  // H1 Heading
  assert.match(guidesLib, /h1Title:\s*"Telangana Police Constable Mock Test Series 2026"/);
  assert.match(examRoute, /guide\?\.h1Title/);

  // H2 Headings
  assert.match(guidesLib, /featuresHeading:\s*"What is Included in our Telangana Police Constable Mock Test Series\?"/);
  assert.match(guideComponent, /guide\.featuresHeading/);

  assert.match(guidesLib, /patternHeading:\s*"Understanding the Exam Pattern"/);
  assert.match(guideComponent, /guide\.patternHeading/);

  assert.match(guidesLib, /pypHeading:\s*"Telangana Police Constable Previous Year Papers"/);
  assert.match(guideComponent, /guide\.pypHeading/);

  assert.match(guidesLib, /tipsHeading:\s*"Tips to Ace the Telangana Police Constable Exam"/);
  assert.match(guideComponent, /guide\.tipsHeading/);

  // H3 Heading
  assert.match(guidesLib, /prelimsMainsDiffHeading:\s*"Prelims vs\. Mains: Understanding the Differences"/);
  assert.match(guideComponent, /guide\.prelimsMainsDiffHeading/);
});

test("Social proof, trust badges, and competitor gap elements are present", async () => {
  const [guideComponent, guidesLib] = await Promise.all([
    read("components/exams/ExamLandingGuide.tsx"),
    read("lib/exam-guides.ts"),
  ]);

  // Social proof data in guides
  assert.match(guidesLib, /1,000\+ Active Aspirants/);
  assert.match(guidesLib, /100% TGPRB Syllabus Aligned/);

  // Previous Year Papers
  assert.match(guideComponent, /id="previous-year-papers"/);
  assert.match(guidesLib, /2024–2025 Pattern/);
  assert.match(guidesLib, /2022 Official Paper/);

  // Exam pattern breakdown
  assert.match(guideComponent, /id="exam-pattern"/);
  assert.match(guidesLib, /200 Questions · 200 Marks · 3 Hours \(Qualifying\)/);
  assert.match(guidesLib, /200 Questions · 200 Marks · 3 Hours \(Merit Selection\)/);
  assert.match(guidesLib, /Arithmetic & Mental Ability \/ Reasoning/);
  assert.match(guidesLib, /Telangana Movement \/ Culture/);

  // Instant performance analytics & rank predictor
  assert.match(guidesLib, /Instant Performance Analytics & Rank Predictor/);
});

test("Quiz and FAQ Schema markup are generated for Google Rich Snippets", async () => {
  const [examRoute, guidesLib] = await Promise.all([
    read("app/mock-tests/[id]/[exam]/page.tsx"),
    read("lib/exam-guides.ts"),
  ]);

  assert.match(examRoute, /buildQuizStructuredData/);
  assert.match(examRoute, /"@type": "FAQPage"/);
  assert.match(guidesLib, /export function buildQuizStructuredData/);
  assert.match(guidesLib, /"@type": "Quiz"/);
  assert.match(guidesLib, /learningResourceType: "Mock Test Series"/);
  assert.match(guidesLib, /timeRequired: `PT\$\{timeMinutes\}M`/);
});

test("Voice search FAQs cover all critical student queries", async () => {
  const guidesLib = await read("lib/exam-guides.ts");

  assert.match(guidesLib, /How to prepare for TG Police Constable\?/);
  assert.match(guidesLib, /What is the exam pattern for Telangana Police Constable Prelims and Mains\?/);
  assert.match(guidesLib, /Is there negative marking in the Telangana Police Constable exam\?/);
  assert.match(guidesLib, /Can I attempt mock tests in Telugu and English\?/);
  assert.match(guidesLib, /How do Previous Year Papers help in cracking the Police Constable exam\?/);
  assert.match(guidesLib, /Does Varadhi Prep provide instant performance analytics and rank prediction\?/);
});

test("Database migration sets the exact SEO title, description, and voice search FAQs", async () => {
  const migration = await read("supabase/migrations/20260910200000_optimize_police_constable_seo.sql");

  assert.match(migration, /Telangana Police Constable Mock Test Series 2026 \| Free/);
  assert.match(migration, /Practice the latest Telangana Police Constable Mock Test 2026 for free/);
  assert.match(migration, /How to prepare for TG Police Constable\?/);
  assert.match(migration, /exam_group\.slug = 'police-constable'/);
});
