"use server";

import { getMockTestCatalogData } from "@/lib/catalog-data";
import { createClient } from "@/lib/supabase/server";

export type AttemptHistoryItem = {
  id: string;
  mock_test_id: string;
  detailed_review_available: boolean;
  submitted_at: string;
  score: number;
  total_marks: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
};

export async function fetchAllStudentAttempts(limit: number = 100) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      attempts: [] as AttemptHistoryItem[],
      testTitles: {} as Record<string, string>,
    };
  }

  const { data: attempts } = await supabase
    .from("test_attempts")
    .select(
      "id, mock_test_id, detailed_review_available, submitted_at, score, total_marks, correct_answers, incorrect_answers, unanswered_questions",
    )
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  const attemptRows = (attempts ?? []) as AttemptHistoryItem[];
  const testIds = Array.from(
    new Set(attemptRows.map((a) => a.mock_test_id).filter(Boolean)),
  );

  const testTitles: Record<string, string> = {};
  if (testIds.length > 0) {
    const catalog = await getMockTestCatalogData();
    const catalogTitles = new Map(catalog.tests.map((test) => [test.id, test.title]));
    const missingIds: string[] = [];

    for (const id of testIds) {
      const catalogTitle = catalogTitles.get(id);
      if (catalogTitle) {
        testTitles[id] = catalogTitle;
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      const { data: tests } = await supabase
        .from("mock_tests")
        .select("id, title")
        .in("id", missingIds);

      for (const test of tests ?? []) {
        if (test.id && test.title) {
          testTitles[test.id] = test.title;
        }
      }
    }
  }

  return { attempts: attemptRows, testTitles };
}
