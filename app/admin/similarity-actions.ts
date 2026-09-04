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
  assignedTests: Array<{
    id: string;
    title: string;
    paperId: string;
    paperName: string;
    examName: string;
  }>;
};

export type DuplicateTextGroup = {
  normalizedKey: string;
  questionTextSample: string;
  count: number;
  subjectNames: string[];
  items: DuplicateQuestionItem[];
  hasIdenticalOptions: boolean;
  isSamePaperConflict: boolean;
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

async function fetchAllAssignments(supabase: Awaited<ReturnType<typeof createClient>>) {
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

export async function scanQuestionTextDuplicates(scope?: {
  examGroupId?: string;
  paperId?: string;
}): Promise<ScanDuplicatesResult> {
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

  // Fetch all active questions, subjects, assignments, tests, papers, and exam groups with automatic pagination past 1000
  const [questions, subjectsResult, assignments, testsResult, papersResult, groupsResult] = await Promise.all([
    fetchAllActiveQuestions(supabase),
    supabase.from("subjects").select("id, name, paper_id"),
    fetchAllAssignments(supabase),
    supabase.from("mock_tests").select("id, title, paper_id"),
    supabase.from("papers").select("id, name, exam_group_id"),
    supabase.from("exam_groups").select("id, name"),
  ]);

  const rawSubjects = subjectsResult.data ?? [];
  const rawPapers = papersResult.data ?? [];
  const subjectMap = new Map(rawSubjects.map((s) => [s.id, s.name]));
  const subjectPaperMap = new Map(rawSubjects.map((s) => [s.id, s.paper_id]));
  const paperMap = new Map(rawPapers.map((p) => [p.id, p]));
  const groupMap = new Map((groupsResult.data ?? []).map((g) => [g.id, g.name]));

  type TestMeta = { id: string; title: string; paperId: string; paperName: string; examName: string };
  const testMap = new Map<string, TestMeta>();
  for (const t of testsResult.data ?? []) {
    const paper = t.paper_id ? paperMap.get(t.paper_id) : undefined;
    const examName = paper?.exam_group_id ? groupMap.get(paper.exam_group_id) ?? "Unknown Exam" : "Unknown Exam";
    testMap.set(t.id, {
      id: t.id,
      title: t.title,
      paperId: t.paper_id ?? "",
      paperName: paper?.name ?? "Unknown Paper",
      examName,
    });
  }

  // Build question -> assigned tests map
  const questionTestsMap = new Map<string, TestMeta[]>();
  for (const row of assignments) {
    const list = questionTestsMap.get(row.question_id) ?? [];
    const meta = testMap.get(row.mock_test_id) ?? {
      id: row.mock_test_id,
      title: "Unknown test",
      paperId: "",
      paperName: "Unknown Paper",
      examName: "Unknown Exam",
    };
    list.push(meta);
    questionTestsMap.set(row.question_id, list);
  }

  // Filter questions by scope if paperId or examGroupId is specified
  const targetPaperId = scope?.paperId && scope.paperId !== "all" ? scope.paperId : undefined;
  const targetExamId = scope?.examGroupId && scope.examGroupId !== "all" ? scope.examGroupId : undefined;

  const scopedQuestions = questions.filter((q) => {
    const assignedTests = questionTestsMap.get(q.id) ?? [];
    const qPaperId = q.subject_id ? subjectPaperMap.get(q.subject_id) : undefined;

    if (targetPaperId) {
      // Must belong to this paper either via subject or assigned mock test
      const matchesSubject = qPaperId === targetPaperId;
      const matchesAssignment = assignedTests.some((t) => t.paperId === targetPaperId);
      if (!matchesSubject && !matchesAssignment) return false;
    }

    if (targetExamId) {
      const paperOfSubject = qPaperId ? paperMap.get(qPaperId) : undefined;
      const matchesExam = paperOfSubject?.exam_group_id === targetExamId;
      const matchesAssignmentExam = assignedTests.some((t) => {
        const p = paperMap.get(t.paperId);
        return p?.exam_group_id === targetExamId;
      });
      if (!matchesExam && !matchesAssignmentExam) return false;
    }

    return true;
  });

  // Group by normalized question text
  const groupsMap = new Map<string, DuplicateQuestionItem[]>();

  for (const q of scopedQuestions) {
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

      // Compare options across all items in this text group
      const normalizeOption = (str: string | null | undefined) =>
        (str ?? "").trim().toLowerCase().replace(/\s+/g, " ");

      const firstItem = items[0];
      const baseOptionsFingerprint = [
        normalizeOption(firstItem.optionA),
        normalizeOption(firstItem.optionB),
        normalizeOption(firstItem.optionC),
        normalizeOption(firstItem.optionD),
      ].sort().join("|||");

      const hasIdenticalOptions = items.every((it) => {
        const fp = [
          normalizeOption(it.optionA),
          normalizeOption(it.optionB),
          normalizeOption(it.optionC),
          normalizeOption(it.optionD),
        ].sort().join("|||");
        return fp === baseOptionsFingerprint;
      });

      // Check if this duplicate appears across multiple tests belonging to the SAME PAPER
      const paperCounts = new Map<string, number>();
      for (const item of items) {
        for (const t of item.assignedTests) {
          if (t.paperId) {
            paperCounts.set(t.paperId, (paperCounts.get(t.paperId) ?? 0) + 1);
          }
        }
      }
      const isSamePaperConflict = Array.from(paperCounts.values()).some((count) => count > 1);

      duplicateGroups.push({
        normalizedKey,
        questionTextSample: items[0].questionText,
        count: items.length,
        subjectNames: uniqueSubjects,
        items,
        hasIdenticalOptions,
        isSamePaperConflict,
      });
    }
  }

  // Sort: Same-paper conflicts FIRST (critical!), then by count descending
  duplicateGroups.sort((a, b) => {
    if (a.isSamePaperConflict && !b.isSamePaperConflict) return -1;
    if (!a.isSamePaperConflict && b.isSamePaperConflict) return 1;
    return b.count - a.count;
  });

  return {
    success: true,
    totalQuestionsScanned: scopedQuestions.length,
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
