import assert from "node:assert/strict";
import test from "node:test";
import { selectRecommendedMockTests } from "../lib/dashboard-recommendations.ts";

function makeTest(overrides) {
  return {
    subject_id: null,
    test_scope: "subject",
    series_number: 1,
    display_order: 1,
    title: `Test ${overrides.id}`,
    duration_minutes: 25,
    slug: `test-${overrides.id}`,
    access_type: "free",
    ...overrides,
  };
}

const papersById = new Map([
  ["paper-tg-1", { id: "paper-tg-1", exam_group_id: "exam-tg" }],
  ["paper-ap-1", { id: "paper-ap-1", exam_group_id: "exam-ap" }],
  ["paper-ap-2", { id: "paper-ap-2", exam_group_id: "exam-ap" }],
  ["paper-dsc-1", { id: "paper-dsc-1", exam_group_id: "exam-dsc" }],
]);

const catalog = [
  makeTest({ id: "t-tg-1", paper_id: "paper-tg-1", subject_id: "sub-ca", series_number: 1, display_order: 1 }),
  makeTest({ id: "t-tg-2", paper_id: "paper-tg-1", subject_id: "sub-ca", series_number: 2, display_order: 2 }),
  makeTest({ id: "t-ap-1", paper_id: "paper-ap-1", subject_id: "sub-ap-gs", series_number: 1, display_order: 3 }),
  makeTest({ id: "t-ap-2", paper_id: "paper-ap-1", subject_id: "sub-ap-gs", series_number: 2, display_order: 4 }),
  makeTest({ id: "t-ap-p2-1", paper_id: "paper-ap-2", subject_id: "sub-hindu", series_number: 1, display_order: 5 }),
  makeTest({ id: "t-dsc-1", paper_id: "paper-dsc-1", subject_id: "sub-dsc", series_number: 1, display_order: 6 }),
];

test("excludes completed tests and prioritizes next test in the same subject/paper/exam", () => {
  const result = selectRecommendedMockTests({
    tests: catalog,
    papersById,
    recentAttemptedTestIds: ["t-ap-1"],
    limit: 4,
  });

  assert.equal(result.length, 4);
  // First recommendation must be Mock Test 02 in the same subject/paper
  assert.equal(result[0].test.id, "t-ap-2");
  assert.equal(result[0].reason, "up_next");
  // Next is same exam (paper-ap-2)
  assert.equal(result[1].test.id, "t-ap-p2-1");
  assert.equal(result[1].reason, "up_next");
  // Already attempted t-ap-1 must NOT appear
  assert.ok(!result.some((item) => item.test.id === "t-ap-1"));
});

test("places active in-progress tests first with in_progress reason", () => {
  const result = selectRecommendedMockTests({
    tests: catalog,
    papersById,
    recentAttemptedTestIds: ["t-ap-1"],
    activeInProgressTestIds: ["t-tg-2"],
    limit: 4,
  });

  assert.equal(result[0].test.id, "t-tg-2");
  assert.equal(result[0].reason, "in_progress");
  assert.ok(!result.some((item) => item.test.id === "t-ap-1"));
});

test("diversifies starter tests across exams for new students with no attempts", () => {
  const result = selectRecommendedMockTests({
    tests: catalog,
    papersById,
    recentAttemptedTestIds: [],
    limit: 4,
  });

  assert.equal(result.length, 4);
  const examGroups = new Set(result.map((item) => papersById.get(item.test.paper_id)?.exam_group_id));
  assert.equal(examGroups.size, 3);
  assert.ok(result.every((item) => item.reason === "recommended"));
});

test("falls back to least recently attempted tests for retake when all tests are completed", () => {
  const result = selectRecommendedMockTests({
    tests: catalog,
    papersById,
    // Most recent first: t-dsc-1 was attempted latest, t-tg-1 was attempted longest ago
    recentAttemptedTestIds: ["t-dsc-1", "t-ap-p2-1", "t-ap-2", "t-ap-1", "t-tg-2", "t-tg-1"],
    limit: 4,
  });

  assert.equal(result.length, 4);
  assert.deepEqual(
    result.map((item) => item.test.id),
    ["t-tg-1", "t-tg-2", "t-ap-1", "t-ap-2"],
  );
  assert.ok(result.every((item) => item.reason === "retake"));
});
