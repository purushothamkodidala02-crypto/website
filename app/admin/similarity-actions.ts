"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DuplicateQuestionItem = {
  id: string;
  questionText: string;
  questionTextTe: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionATe: string | null;
  optionBTe: string | null;
  optionCTe: string | null;
  optionDTe: string | null;
  correctAnswer: string;
  explanation: string | null;
  explanationTe: string | null;
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

async function fetchAllActiveQuestions(supabase: Awaited<ReturnType<typeof createClient>>) {
  const pageSize = 1000;
  let from = 0;
  let all: Array<{
    id: string;
    question_text: string;
    question_text_te: string | null;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    option_a_te: string | null;
    option_b_te: string | null;
    option_c_te: string | null;
    option_d_te: string | null;
    correct_answer: string;
    explanation: string | null;
    explanation_te: string | null;
    subject_id: string | null;
    created_at: string;
  }> = [];
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        question_text_te,
        option_a,
        option_b,
        option_c,
        option_d,
        option_a_te,
        option_b_te,
        option_c_te,
        option_d_te,
        correct_answer,
        explanation,
        explanation_te,
        subject_id,
        created_at
      `)
      .eq("is_active", true)
      .range(from, from + pageSize - 1);

    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      all = all.concat(data);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    }
  }
  return all;
}

export async function fetchAllAssignments(supabase: Awaited<ReturnType<typeof createClient>>) {
  const pageSize = 1000;
  let from = 0;
  let all: Array<{ mock_test_id: string; question_id: string }> = [];
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("mock_test_questions")
      .select("mock_test_id, question_id")
      .range(from, from + pageSize - 1);

    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      all = all.concat(data);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    }
  }
  return all;
}

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

  // Fetch all active questions, subjects, assignments, and tests with automatic pagination past 1000
  const [questions, subjectsResult, assignments, testsResult] = await Promise.all([
    fetchAllActiveQuestions(supabase),
    supabase.from("subjects").select("id, name"),
    fetchAllAssignments(supabase),
    supabase.from("mock_tests").select("id, title"),
  ]);

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
      questionTextTe: q.question_text_te,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      optionATe: q.option_a_te,
      optionBTe: q.option_b_te,
      optionCTe: q.option_c_te,
      optionDTe: q.option_d_te,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      explanationTe: q.explanation_te,
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

export async function deleteUnassignedQuestion(
  questionId: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { success: false, message: "Admin privileges required." };

  // Safety check: verify it is not assigned to any mock test
  const { count: assignmentCount } = await supabase
    .from("mock_test_questions")
    .select("id", { count: "exact", head: true })
    .eq("question_id", questionId);

  if ((assignmentCount ?? 0) > 0) {
    return {
      success: false,
      message: "This question is actively assigned to a mock test and cannot be deleted here.",
    };
  }

  // Safety check: verify no student attempts reference this question
  const { count: attemptUsage } = await supabase
    .from("test_attempt_session_questions")
    .select("id", { count: "exact", head: true })
    .eq("question_id", questionId);

  if ((attemptUsage ?? 0) > 0) {
    return {
      success: false,
      message: "This question is referenced in student attempt history and cannot be deleted.",
    };
  }

  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/questions");
  revalidatePath("/admin/similarity");
  revalidatePath("/admin");

  return { success: true, message: "Unassigned duplicate question deleted successfully." };
}

export async function deleteBulkUnassignedDuplicates(questionIds: string[]): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, deletedCount: 0, message: "Unauthorized." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { success: false, deletedCount: 0, message: "Admin privileges required." };

  if (!questionIds.length) {
    return { success: false, deletedCount: 0, message: "No question IDs provided." };
  }

  // Find all questionIds that are assigned to mock tests
  const { data: assignedRows } = await supabase
    .from("mock_test_questions")
    .select("question_id")
    .in("question_id", questionIds);

  const assignedSet = new Set((assignedRows ?? []).map((r) => r.question_id));

  // Find all questionIds in student attempts
  const { data: attemptRows } = await supabase
    .from("test_attempt_session_questions")
    .select("question_id")
    .in("question_id", questionIds);

  const attemptSet = new Set((attemptRows ?? []).map((r) => r.question_id));

  // Filter only truly unassigned, safe-to-delete question IDs
  const safeToDelete = questionIds.filter((id) => !assignedSet.has(id) && !attemptSet.has(id));

  if (!safeToDelete.length) {
    return {
      success: false,
      deletedCount: 0,
      message: "None of the selected questions are unassigned (they are actively in use).",
    };
  }

  const { error } = await supabase.from("questions").delete().in("id", safeToDelete);
  if (error) {
    return { success: false, deletedCount: 0, message: error.message };
  }

  revalidatePath("/admin/questions");
  revalidatePath("/admin/similarity");
  revalidatePath("/admin");

  return {
    success: true,
    deletedCount: safeToDelete.length,
    message: `Successfully deleted ${safeToDelete.length} unassigned duplicate question${safeToDelete.length === 1 ? "" : "s"}.`,
  };
}
