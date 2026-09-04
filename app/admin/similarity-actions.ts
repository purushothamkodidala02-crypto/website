"use server";

import { createClient } from "@/lib/supabase/server";

export type DuplicateQuestionItem = {
  id: string;
  questionText: string;
  subjectId: string | null;
  subjectName: string;
  createdAt: string;
  assignedTests: Array<{ id: string; title: string }>;
};

export type DuplicateTextGroup = {
  normalizedKey: string;
  questionTextSample: string;
  count: number;
  subjectNames: string[];
  items: DuplicateQuestionItem[];
};

export type ScanDuplicatesResult = {
  success: boolean;
  message?: string;
  totalQuestionsScanned: number;
  duplicateGroups: DuplicateTextGroup[];
};

export async function scanQuestionTextDuplicates(): Promise<ScanDuplicatesResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized", totalQuestionsScanned: 0, duplicateGroups: [] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, message: "Admin privileges required", totalQuestionsScanned: 0, duplicateGroups: [] };
  }

  // Fetch questions with text and subject
  const [questionsResult, subjectsResult, assignmentsResult, testsResult] = await Promise.all([
    supabase
      .from("questions")
      .select("id, question_text, subject_id, created_at")
      .eq("is_active", true),
    supabase.from("subjects").select("id, name"),
    supabase.from("mock_test_questions").select("mock_test_id, question_id"),
    supabase.from("mock_tests").select("id, title"),
  ]);

  const questions = questionsResult.data ?? [];
  const subjectMap = new Map((subjectsResult.data ?? []).map((s) => [s.id, s.name]));
  const testMap = new Map((testsResult.data ?? []).map((t) => [t.id, t.title]));

  // Build question -> assigned tests map
  const questionTestsMap = new Map<string, Array<{ id: string; title: string }>>();
  for (const row of assignmentsResult.data ?? []) {
    const list = questionTestsMap.get(row.question_id) ?? [];
    const title = testMap.get(row.mock_test_id) ?? "Unknown test";
    list.push({ id: row.mock_test_id, title });
    questionTestsMap.set(row.question_id, list);
  }

  // Group by normalized question text
  const groupsMap = new Map<string, DuplicateQuestionItem[]>();

  for (const q of questions) {
    if (!q.question_text) continue;
    // Normalize text: lowercase, remove excess whitespace and common punctuation
    const normalized = q.question_text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[\u200B-\u200D\uFEFF]/g, "");

    if (normalized.length < 10) continue; // Ignore very short fragments

    const currentList = groupsMap.get(normalized) ?? [];
    currentList.push({
      id: q.id,
      questionText: q.question_text,
      subjectId: q.subject_id,
      subjectName: q.subject_id ? subjectMap.get(q.subject_id) ?? "Unknown subject" : "Unassigned",
      createdAt: q.created_at,
      assignedTests: questionTestsMap.get(q.id) ?? [],
    });
    groupsMap.set(normalized, currentList);
  }

  // Filter groups with more than 1 question (true text duplicates)
  const duplicateGroups: DuplicateTextGroup[] = [];

  for (const [normalizedKey, items] of groupsMap.entries()) {
    if (items.length > 1) {
      const uniqueSubjects = Array.from(new Set(items.map((i) => i.subjectName)));
      duplicateGroups.push({
        normalizedKey,
        questionTextSample: items[0].questionText,
        count: items.length,
        subjectNames: uniqueSubjects,
        items,
      });
    }
  }

  // Sort by count descending
  duplicateGroups.sort((a, b) => b.count - a.count);

  return {
    success: true,
    totalQuestionsScanned: questions.length,
    duplicateGroups,
  };
}
