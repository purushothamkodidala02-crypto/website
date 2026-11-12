import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  formatMarkValue,
  formatPatternNegativeDisplay,
  resolveMockTestScoring,
  summarizeExamNegativeMarking,
} from "../lib/scoring.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("resolveMockTestScoring keeps negative marking consistent across question, stats, and paper fallbacks", () => {
  const fromQuestions = resolveMockTestScoring({
    questions: [
      { marks: 1, negative_marks: 0.25 },
      { marks: 1, negative_marks: 0.25 },
    ],
    stats: { question_count: 2, total_marks: 2, maximum_negative_marks: 0.25 },
    defaultCorrectMarks: 1,
    defaultNegativeMarks: 0,
  });
  assert.equal(fromQuestions.questionCount, 2);
  assert.equal(fromQuestions.totalMarks, 2);
  assert.equal(fromQuestions.negativeMarks, 0.25);
  assert.equal(fromQuestions.negativeSummaryLabel, "0.25");
  assert.equal(fromQuestions.markingPairLabel, "+1 / -0.25");

  const fromStatsWhenMqBlocked = resolveMockTestScoring({
    questions: [],
    stats: { question_count: 200, total_marks: 200, maximum_negative_marks: 0.25 },
    targetQuestionCount: 200,
    paperQuestionCount: 200,
    defaultCorrectMarks: 1,
    defaultNegativeMarks: 0.25,
  });
  assert.equal(fromStatsWhenMqBlocked.questionCount, 200);
  assert.equal(fromStatsWhenMqBlocked.totalMarks, 200);
  assert.equal(fromStatsWhenMqBlocked.negativeMarks, 0.25);
  assert.equal(fromStatsWhenMqBlocked.markingPairLabel, "+1 / -0.25");
  assert.equal(fromStatsWhenMqBlocked.cardNegativeLabel, "-0.25 Negative");

  const fromPaperFallbackWithoutStats = resolveMockTestScoring({
    questions: [],
    stats: null,
    targetQuestionCount: 150,
    paperQuestionCount: 150,
    defaultCorrectMarks: 1,
    defaultNegativeMarks: 0.25,
  });
  assert.equal(fromPaperFallbackWithoutStats.questionCount, 150);
  assert.equal(fromPaperFallbackWithoutStats.totalMarks, 150);
  assert.equal(fromPaperFallbackWithoutStats.negativeMarks, 0.25);
  assert.equal(fromPaperFallbackWithoutStats.negativeSummaryLabel, "0.25");

  const noNegativePaper = resolveMockTestScoring({
    questions: [],
    stats: { question_count: 150, total_marks: 150, maximum_negative_marks: 0 },
    defaultCorrectMarks: 1,
    defaultNegativeMarks: 0,
  });
  assert.equal(noNegativePaper.hasNegativeMarking, false);
  assert.equal(noNegativePaper.negativeMarks, 0);
  assert.equal(noNegativePaper.negativeSummaryLabel, "No negative marking");
  assert.equal(noNegativePaper.markingPairLabel, "+1 / None");
  assert.equal(noNegativePaper.cardNegativeLabel, "No Negative");

  assert.equal(formatMarkValue(1.0), "1");
  assert.equal(formatMarkValue(0.25), "0.25");
  assert.equal(formatMarkValue(0.5), "0.5");
});

test("exam negative marking summary and pattern formatting adapt to exam rules", () => {
  const zeroNegExam = summarizeExamNegativeMarking([
    { default_negative_marks: 0 },
    { default_negative_marks: 0 },
  ]);
  assert.equal(zeroNegExam.hasAnyNegative, false);
  assert.equal(zeroNegExam.cardTitle, "No Negative Marking");
  assert.doesNotMatch(zeroNegExam.cardDescription, /0\.25 penalty/);

  const uniformQuarterExam = summarizeExamNegativeMarking([
    { default_negative_marks: 0.25 },
    { default_negative_marks: 0.25 },
  ]);
  assert.equal(uniformQuarterExam.hasAnyNegative, true);
  assert.equal(uniformQuarterExam.cardTitle, "Realistic Negative Marking");
  assert.match(uniformQuarterExam.cardDescription, /0\.25 penalty scoring/);

  const mixedExam = summarizeExamNegativeMarking([
    { default_negative_marks: 0 },
    { default_negative_marks: 0.33 },
  ]);
  assert.equal(mixedExam.cardTitle, "Paper-Specific Marking Rules");
  assert.match(mixedExam.cardDescription, /-0\.33/);

  assert.deepEqual(
    formatPatternNegativeDisplay("0.25 (1/4 mark deducted per wrong answer)"),
    { headline: "0.25 Mark", detail: "1/4 Deduction" },
  );
  assert.deepEqual(formatPatternNegativeDisplay("No negative marking"), {
    headline: "None",
    detail: "No Deduction",
  });
});

test("catalog query, detail page, and exam page use resolved negative marking instead of hardcoded defaults", async () => {
  const [catalogData, detailPage, examPage, paperPage, catalogPage] = await Promise.all([
    read("lib/catalog-data.ts"),
    read("components/mock-tests/MockTestDetailPage.tsx"),
    read("app/mock-tests/[id]/[exam]/page.tsx"),
    read("app/mock-tests/[id]/[exam]/[paper]/page.tsx"),
    read("app/mock-tests/page.tsx"),
  ]);

  assert.match(
    catalogData,
    /\.from\("papers"\)[\s\S]*default_correct_marks,\s*default_negative_marks/,
  );
  assert.match(detailPage, /createAdminClient/);
  assert.match(detailPage, /catalog\.stats/);
  assert.match(detailPage, /resolveMockTestScoring/);
  assert.match(detailPage, /with no negative marking/);
  assert.match(examPage, /summarizeExamNegativeMarking/);
  assert.match(examPage, /formatPatternNegativeDisplay/);
  assert.doesNotMatch(examPage, /Real 0\.25 penalty scoring/);
  assert.doesNotMatch(examPage, />\s*0\.25 Mark\s*</);
  assert.match(paperPage, /default_negative_marks/);
  assert.match(catalogPage, /resolveMockTestScoring/);
  assert.match(catalogPage, /summarizeExamNegativeMarking/);
});
