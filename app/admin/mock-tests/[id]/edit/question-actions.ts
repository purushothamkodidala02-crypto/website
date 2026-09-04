"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export type AssignmentState = { success: boolean; message: string };
function revalidateMockTestQuestions(mockTestId: string) {
  revalidatePath(`/admin/mock-tests/${mockTestId}/edit`);
  revalidatePath(`/admin/mock-tests/${mockTestId}/questions`);
  revalidatePath(`/admin/mock-tests/${mockTestId}/preview`);
}
async function draft(mockTestId: string, allowPublishedWithoutAttempts = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "You must be logged in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { supabase, error: "You are not authorized to manage Questions." };
  const { data: mockTest } = await supabase.from("mock_tests").select("id, paper_id, subject_id, test_scope, status, target_question_count").eq("id", mockTestId).maybeSingle();
  if (!mockTest) return { supabase, error: "Mock Test not found." };
  const { count } = await supabase.from("test_attempts").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTestId);
  if ((count ?? 0) > 0) return { supabase, error: "This Mock Test has student attempts and its Questions are locked." };
  if (mockTest.status !== "draft" && !allowPublishedWithoutAttempts) return { supabase, error: "Only draft Mock Tests can be changed." };
  return { supabase, mockTest };
}
function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ");
}

export async function assignQuestion(mockTestId: string, _previous: AssignmentState, formData: FormData): Promise<AssignmentState> {
  const result = await draft(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to assign Question." };
  const questionId = String(formData.get("question_id") ?? "").trim();
  const questionOrder = Number(formData.get("question_order") ?? 0);
  const marks = Number(formData.get("marks") ?? 0);
  const negativeMarks = Number(formData.get("negative_marks") ?? 0);
  if (!questionId || !Number.isInteger(questionOrder) || questionOrder < 1 || !Number.isFinite(marks) || marks <= 0 || !Number.isFinite(negativeMarks) || negativeMarks < 0) {
    return { success: false, message: "Choose a Question, order, marks, and negative marks." };
  }

  const { data: question } = await result.supabase
    .from("questions")
    .select("id, subject_id, is_active, expires_on, question_text, question_text_te")
    .eq("id", questionId)
    .maybeSingle();

  if (!question || !question.is_active || (question.expires_on && question.expires_on < new Date().toISOString().slice(0, 10))) {
    return { success: false, message: "The selected active Question could not be found." };
  }

  const { data: subject } = await result.supabase.from("subjects").select("paper_id").eq("id", question.subject_id).maybeSingle();
  if (!subject || subject.paper_id !== result.mockTest.paper_id || (result.mockTest.test_scope === "subject" && question.subject_id !== result.mockTest.subject_id)) {
    return { success: false, message: "Choose a Question from this Mock Test’s Paper and Subject." };
  }

  // Prevent assigning questions that are already in any mock test of the same paper
  const { data: siblingMockTests } = await result.supabase
    .from("mock_tests")
    .select("id, title")
    .eq("paper_id", result.mockTest.paper_id);

  const siblingTestIds = (siblingMockTests ?? []).map((t) => t.id);
  const siblingTestMap = new Map((siblingMockTests ?? []).map((t) => [t.id, t.title]));

  if (siblingTestIds.length > 0) {
    // 1. Direct question_id duplicate check across all mock tests of this paper
    const { data: existingAssignments } = await result.supabase
      .from("mock_test_questions")
      .select("mock_test_id, question_id")
      .eq("question_id", questionId)
      .in("mock_test_id", siblingTestIds);

    if (existingAssignments && existingAssignments.length > 0) {
      const thisAssignment = existingAssignments.find((a) => a.mock_test_id === mockTestId);
      if (thisAssignment) {
        return { success: false, message: "This question is already assigned to this Mock Test." };
      }
      const otherAssignment = existingAssignments[0];
      const otherTitle = siblingTestMap.get(otherAssignment.mock_test_id) ?? "another Mock Test";
      return {
        success: false,
        message: `Duplicate question blocked! This question is already assigned to "${otherTitle}". Questions cannot be repeated across mock tests in the same paper series.`,
      };
    }

    // 2. Duplicate question text check across all mock tests of this paper
    const normNewEn = normalizeText(question.question_text);
    const normNewTe = normalizeText(question.question_text_te);

    if (normNewEn.length >= 10 || normNewTe.length >= 10) {
      const { data: assignedSiblingQuestions } = await result.supabase
        .from("mock_test_questions")
        .select(`
          mock_test_id,
          question_id,
          questions!inner (
            id,
            question_text,
            question_text_te
          )
        `)
        .in("mock_test_id", siblingTestIds)
        .neq("question_id", questionId);

      for (const item of assignedSiblingQuestions ?? []) {
        // @ts-expect-error Inner join returns single object
        const qData = item.questions as { id: string; question_text: string | null; question_text_te: string | null } | null;
        if (!qData) continue;
        const normDbEn = normalizeText(qData.question_text);
        const normDbTe = normalizeText(qData.question_text_te);

        const isMatch =
          (normNewEn.length >= 10 && normDbEn && normNewEn === normDbEn) ||
          (normNewTe.length >= 10 && normDbTe && normNewTe === normDbTe);

        if (isMatch) {
          const testTitle = siblingTestMap.get(item.mock_test_id) ?? "another Mock Test";
          if (item.mock_test_id === mockTestId) {
            return { success: false, message: "A question with identical text is already assigned to this Mock Test." };
          }
          return {
            success: false,
            message: `Duplicate question blocked! A question with identical text is already assigned to "${testTitle}". Questions cannot be repeated across mock tests in the same paper series.`,
          };
        }
      }
    }
  }

  const { error } = await result.supabase.from("mock_test_questions").insert({
    mock_test_id: mockTestId,
    question_id: questionId,
    question_order: questionOrder,
    marks,
    negative_marks: negativeMarks,
  });

  if (error?.code === "23505") return { success: false, message: "That Question or order number is already assigned." };
  if (error) return { success: false, message: error.message };
  revalidateMockTestQuestions(mockTestId);
  return { success: true, message: "Question added." };
}
export async function removeAssignedQuestion(mockTestId: string, assignmentId: string): Promise<AssignmentState> { const result = await draft(mockTestId); if ("error" in result) return { success: false, message: result.error ?? "Unable to remove Question." }; const { error } = await result.supabase.from("mock_test_questions").delete().eq("id", assignmentId).eq("mock_test_id", mockTestId); if (error) return { success: false, message: error.message }; revalidateMockTestQuestions(mockTestId); return { success: true, message: "Question removed." }; }

export async function fillRemainingWithLatest(mockTestId: string): Promise<AssignmentState> {
  const result = await draft(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to fill the remaining slots." };
  const { data, error } = await result.supabase.rpc("fill_mock_test_with_latest_questions", { requested_mock_test_id: mockTestId });
  if (error) return { success: false, message: error.message };
  const summary = data?.[0] ?? { assigned: 0, remaining: result.mockTest.target_question_count };
  const assigned = Number(summary.assigned);
  const remaining = Number(summary.remaining);
  revalidateMockTestQuestions(mockTestId);
  return { success: true, message: assigned > 0 ? `${assigned} latest eligible Question${assigned === 1 ? " was" : "s were"} assigned.${remaining ? ` ${remaining} slot${remaining === 1 ? " remains" : "s remain"}.` : " The target is complete."}` : remaining ? `No additional eligible Questions were found. ${remaining} slot${remaining === 1 ? " remains" : "s remain"}.` : "This Mock Test already meets its target." };
}

export async function moveAssignedQuestion(mockTestId: string, assignmentId: string, direction: -1 | 1): Promise<AssignmentState> {
  const result = await draft(mockTestId);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to reorder the Question." };
  const { error } = await result.supabase.rpc("move_mock_test_question", { requested_mock_test_id: mockTestId, requested_assignment_id: assignmentId, requested_direction: direction });
  if (error) return { success: false, message: error.message };
  revalidateMockTestQuestions(mockTestId);
  return { success: true, message: "Question order updated." };
}

export async function sortAssignedQuestionsBySubjectOrder(mockTestId: string): Promise<AssignmentState> {
  const result = await draft(mockTestId, true);
  if ("error" in result) return { success: false, message: result.error ?? "Unable to sort Questions." };

  const { data: assignments, error: fetchError } = await result.supabase
    .from("mock_test_questions")
    .select("id, question_order, questions!inner ( subject_id, subjects!inner ( display_order ) )")
    .eq("mock_test_id", mockTestId)
    .order("question_order");

  if (fetchError || !assignments) return { success: false, message: fetchError?.message || "Could not fetch questions." };
  if (assignments.length <= 1) return { success: true, message: "No questions to sort." };

  const sorted = [...assignments].sort((a, b) => {
    // @ts-expect-error Inner join returns single object
    const orderA = Number(a.questions?.subjects?.display_order ?? 0);
    // @ts-expect-error Inner join returns single object
    const orderB = Number(b.questions?.subjects?.display_order ?? 0);
    if (orderA !== orderB) return orderA - orderB;
    return a.question_order - b.question_order;
  });

  const needsUpdate = sorted.some((a, index) => a.id !== assignments[index].id);
  if (!needsUpdate) return { success: true, message: "Questions are already sorted by subject." };

  const offset = 100000;
  
  // Pass 1: Shift to avoid unique constraint violations
  await Promise.all(sorted.map((item, index) => 
    result.supabase.from("mock_test_questions").update({ question_order: offset + index + 1 }).eq("id", item.id)
  ));

  // Pass 2: Set final order
  await Promise.all(sorted.map((item, index) => 
    result.supabase.from("mock_test_questions").update({ question_order: index + 1 }).eq("id", item.id)
  ));

  revalidateMockTestQuestions(mockTestId);
  return { success: true, message: "Questions reordered by subject successfully." };
}
