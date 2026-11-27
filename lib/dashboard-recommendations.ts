export type DashboardCatalogMockTest = {
  id: string;
  paper_id: string;
  subject_id: string | null;
  test_scope: string | null;
  series_number: number | null;
  display_order: number | null;
  title: string;
  duration_minutes: number;
  slug: string;
  access_type: "free" | "paid";
};

export type RecommendationReason =
  | "in_progress"
  | "up_next"
  | "recommended"
  | "retake";

export type RecommendedMockTest = {
  test: DashboardCatalogMockTest;
  reason: RecommendationReason;
};

type PaperRef = {
  id: string;
  exam_group_id: string;
};

function compareCatalogOrder(a: DashboardCatalogMockTest, b: DashboardCatalogMockTest): number {
  const seriesA = Number(a.series_number ?? Number.MAX_SAFE_INTEGER);
  const seriesB = Number(b.series_number ?? Number.MAX_SAFE_INTEGER);
  if (seriesA !== seriesB) return seriesA - seriesB;

  const orderA = Number(a.display_order ?? Number.MAX_SAFE_INTEGER);
  const orderB = Number(b.display_order ?? Number.MAX_SAFE_INTEGER);
  if (orderA !== orderB) return orderA - orderB;

  return a.title.localeCompare(b.title);
}

/**
 * Selects up to `limit` mock tests for the dashboard "Choose your next practice test"
 * section based on the student's active sessions and completed attempts:
 * 1. Unfinished in-progress sessions (resumable right away).
 * 2. Unattempted tests in the student's active subject, paper, or exam (ordered by series).
 * 3. Unattempted tests across other exams (diversified round-robin by exam).
 * 4. Least recently attempted tests as a retake fallback if every test is completed.
 */
export function selectRecommendedMockTests({
  tests,
  papersById,
  recentAttemptedTestIds,
  activeInProgressTestIds = [],
  limit = 4,
}: {
  tests: DashboardCatalogMockTest[];
  papersById: Map<string, PaperRef>;
  recentAttemptedTestIds: string[];
  activeInProgressTestIds?: string[];
  limit?: number;
}): RecommendedMockTest[] {
  if (tests.length === 0 || limit <= 0) return [];

  const testById = new Map(tests.map((test) => [test.id, test]));
  const selected: RecommendedMockTest[] = [];
  const selectedIds = new Set<string>();

  const pushSelection = (test: DashboardCatalogMockTest, reason: RecommendationReason) => {
    if (selected.length >= limit || selectedIds.has(test.id)) return;
    selectedIds.add(test.id);
    selected.push({ test, reason });
  };

  // 1. Prioritize active in-progress sessions so the student can resume immediately
  for (const testId of activeInProgressTestIds) {
    const test = testById.get(testId);
    if (test) {
      pushSelection(test, "in_progress");
    }
  }

  if (selected.length >= limit) {
    return selected;
  }

  const attemptedSet = new Set(recentAttemptedTestIds);

  // Build ordered recency lists from active sessions + recent completed attempts
  const recentSubjectIds: string[] = [];
  const recentPaperIds: string[] = [];
  const recentExamGroupIds: string[] = [];

  for (const testId of [...activeInProgressTestIds, ...recentAttemptedTestIds]) {
    const test = testById.get(testId);
    if (!test) continue;
    if (test.subject_id && !recentSubjectIds.includes(test.subject_id)) {
      recentSubjectIds.push(test.subject_id);
    }
    if (test.paper_id && !recentPaperIds.includes(test.paper_id)) {
      recentPaperIds.push(test.paper_id);
    }
    const examGroupId = papersById.get(test.paper_id)?.exam_group_id;
    if (examGroupId && !recentExamGroupIds.includes(examGroupId)) {
      recentExamGroupIds.push(examGroupId);
    }
  }

  const unattemptedTests = tests.filter(
    (test) => !attemptedSet.has(test.id) && !selectedIds.has(test.id),
  );

  // 2. Unattempted tests relevant to the student's active subject, paper, or exam
  const relatedBuckets: Array<{
    test: DashboardCatalogMockTest;
    tier: number;
    recency: number;
  }> = [];
  const otherUnattempted: DashboardCatalogMockTest[] = [];

  for (const test of unattemptedTests) {
    const subjectIdx = test.subject_id ? recentSubjectIds.indexOf(test.subject_id) : -1;
    if (subjectIdx !== -1) {
      relatedBuckets.push({ test, tier: 0, recency: subjectIdx });
      continue;
    }

    const paperIdx = recentPaperIds.indexOf(test.paper_id);
    if (paperIdx !== -1) {
      relatedBuckets.push({ test, tier: 1, recency: paperIdx });
      continue;
    }

    const examGroupId = papersById.get(test.paper_id)?.exam_group_id;
    const examIdx = examGroupId ? recentExamGroupIds.indexOf(examGroupId) : -1;
    if (examIdx !== -1) {
      relatedBuckets.push({ test, tier: 2, recency: examIdx });
      continue;
    }

    otherUnattempted.push(test);
  }

  relatedBuckets.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.recency !== b.recency) return a.recency - b.recency;
    return compareCatalogOrder(a.test, b.test);
  });

  for (const item of relatedBuckets) {
    pushSelection(item.test, "up_next");
    if (selected.length >= limit) return selected;
  }

  // 3. Remaining unattempted tests diversified across exam groups (round-robin)
  const sortedOthers = [...otherUnattempted].sort(compareCatalogOrder);
  const byExamGroup = new Map<string, DashboardCatalogMockTest[]>();
  for (const test of sortedOthers) {
    const groupKey = papersById.get(test.paper_id)?.exam_group_id ?? test.paper_id;
    const queue = byExamGroup.get(groupKey);
    if (queue) {
      queue.push(test);
    } else {
      byExamGroup.set(groupKey, [test]);
    }
  }

  const queues = Array.from(byExamGroup.values());
  let roundIndex = 0;
  let addedInRound = true;
  while (selected.length < limit && addedInRound) {
    addedInRound = false;
    for (const queue of queues) {
      if (roundIndex < queue.length) {
        pushSelection(queue[roundIndex], "recommended");
        addedInRound = true;
        if (selected.length >= limit) return selected;
      }
    }
    roundIndex += 1;
  }

  // 4. Retake fallback when every published test has already been attempted
  const uniqueLatestIndex = new Map<string, number>();
  recentAttemptedTestIds.forEach((id, idx) => {
    if (!uniqueLatestIndex.has(id)) {
      uniqueLatestIndex.set(id, idx);
    }
  });

  const attemptedTests = tests
    .filter((test) => !selectedIds.has(test.id))
    .sort((a, b) => {
      const idxA = uniqueLatestIndex.get(a.id) ?? -1;
      const idxB = uniqueLatestIndex.get(b.id) ?? -1;
      // Higher index = attempted longer ago; surface least recently attempted first
      if (idxA !== idxB) return idxB - idxA;
      return compareCatalogOrder(a, b);
    });

  for (const test of attemptedTests) {
    pushSelection(test, "retake");
    if (selected.length >= limit) break;
  }

  return selected;
}
