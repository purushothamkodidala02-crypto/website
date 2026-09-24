"use server";

import { revalidatePath } from "next/cache";
import { buildMockTestTitle } from "@/lib/exam-catalog";
import { readMockTestAccess } from "@/lib/mock-test-access";
import { mockTestSlug } from "@/lib/public-urls";
import { createClient } from "@/lib/supabase/server";
import type { MockTestScope } from "@/types/mock-test";

export type CreateMockTestState = { success: boolean; message: string };

export async function createMockTest(_previous: CreateMockTestState, formData: FormData): Promise<CreateMockTestState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be logged in." };
  const stateId = String(formData.get("state_id") ?? "").trim();
  const categoryId = String(formData.get("exam_id") ?? "").trim();
  const examId = String(formData.get("exam_group_id") ?? "").trim();
  const paperId = String(formData.get("paper_id") ?? "").trim();
  const scope = String(formData.get("test_scope") ?? "paper") as MockTestScope;
  const subjectId = String(formData.get("subject_id") ?? "").trim() || null;
  const subjectSectionId = String(formData.get("subject_section_id") ?? "").trim() || null;
  const duration = Number(formData.get("duration_minutes") ?? 0);
  const requestedTarget = Number(formData.get("target_question_count") ?? 0);
  const pricing = readMockTestAccess(formData);
  if (!stateId || !categoryId || !examId || !paperId) return { success: false, message: "Choose the state, board, exam and paper." };
  if (!Number.isInteger(duration) || duration <= 0) return { success: false, message: "Enter a valid duration." };
  if (!Number.isInteger(requestedTarget) || requestedTarget < 1 || requestedTarget > 500) return { success: false, message: "Enter a target between 1 and 500 Questions." };
  if (scope !== "paper" && scope !== "subject") return { success: false, message: "Choose a valid practice coverage." };
  if (scope === "subject" && !subjectId) return { success: false, message: "Choose a subject for a subject-only mock." };
  if (pricing.error) return { success: false, message: pricing.error };

  let existingSeriesQuery = supabase
    .from("mock_tests")
    .select("series_number")
    .eq("paper_id", paperId)
    .eq("test_scope", scope)
    .is("superseded_by_mock_test_id", null);
  if (scope === "subject") {
    existingSeriesQuery = existingSeriesQuery.eq("subject_id", subjectId);
    if (subjectSectionId) {
      existingSeriesQuery = existingSeriesQuery.eq("subject_section_id", subjectSectionId);
    } else {
      existingSeriesQuery = existingSeriesQuery.is("subject_section_id", null);
    }
  } else {
    existingSeriesQuery = existingSeriesQuery.is("subject_id", null);
  }

  const [
    profileResult,
    stateResult,
    categoryResult,
    groupResult,
    paperResult,
    subjectResult,
    sectionResult,
    seriesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("exam_states").select("id, name, code, slug").eq("id", stateId).maybeSingle(),
    supabase.from("exams").select("id, state_id, name").eq("id", categoryId).maybeSingle(),
    supabase.from("exam_groups").select("id, exam_id, name, slug").eq("id", examId).maybeSingle(),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, display_order, question_count").eq("id", paperId).maybeSingle(),
    subjectId ? supabase.from("subjects").select("id, paper_id, name, slug").eq("id", subjectId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    subjectSectionId ? supabase.from("subject_sections").select("id, subject_id, name, slug").eq("id", subjectSectionId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    existingSeriesQuery,
  ]);

  if (profileResult.data?.role !== "admin") {
    return { success: false, message: "You are not authorized to create mock tests." };
  }

  const state = stateResult.data;
  const category = categoryResult.data;
  const group = groupResult.data;
  const paper = paperResult.data;
  const subject = subjectResult.data;
  const section = sectionResult.data;
  if (!state || !category || !group || !paper || category.state_id !== state.id || group.exam_id !== category.id || paper.exam_group_id !== group.id || (scope === "subject" && (!subject || subject.paper_id !== paper.id)) || (scope === "subject" && subjectSectionId && (!section || section.subject_id !== subjectId))) {
    return { success: false, message: "The selected state, board, exam, paper, subject and sub-section do not belong together." };
  }

  const { data: existingSeries, error: seriesError } = seriesResult;
  if (seriesError) return { success: false, message: seriesError.message };

  const existingSet = new Set((existingSeries ?? []).map((item) => Number(item.series_number)));

  // Lowest missing positive integer from 1 upwards (gap filling)
  let firstAvailableNumber = 1;
  while (existingSet.has(firstAvailableNumber)) {
    firstAvailableNumber++;
  }

  const requestedSeriesRaw = formData.get("series_number") ?? formData.get("expected_series_number");
  const parsedRequested = requestedSeriesRaw ? Number(requestedSeriesRaw) : NaN;
  const seriesNumber = Number.isInteger(parsedRequested) && parsedRequested > 0
    ? parsedRequested
    : firstAvailableNumber;

  if (existingSet.has(seriesNumber)) {
    return {
      success: false,
      message: `Mock Test ${String(seriesNumber).padStart(2, "0")} already exists in this series. Please choose an unused number.`,
    };
  }
  const { data: specialization } = paper.specialization_id
    ? await supabase.from("exam_specializations").select("name").eq("id", paper.specialization_id).maybeSingle()
    : { data: null };
  const title = buildMockTestTitle({ stateCode: state.code, examName: group.name, paperName: specialization?.name ?? paper.name, subjectName: subject?.name, sectionName: section?.name, seriesNumber });
  const slug = mockTestSlug(seriesNumber, subject?.slug, section?.slug);
  const targetQuestionCount = scope === "paper" ? Number(paper.question_count ?? requestedTarget) : requestedTarget;
  const { error } = await supabase.from("mock_tests").insert({
    paper_id: paperId,
    subject_id: scope === "subject" ? subjectId : null,
    subject_section_id: scope === "subject" ? subjectSectionId : null,
    test_scope: scope,
    series_number: seriesNumber,
    title,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    instructions: null,
    duration_minutes: duration,
    target_question_count: targetQuestionCount,
    difficulty: "mixed",
    status: "draft",
    version: 1,
    display_order: seriesNumber,
    published_at: null,
    access_type: pricing.accessType,
    price_inr: pricing.priceInr,
  });
  if (error?.code === "23505") {
    if (error.message?.includes("uq_mock_tests_subject_series")) {
      return {
        success: false,
        message: "Database index update required: Please execute migration 20260920130000_fix_subject_series_unique_index.sql in Supabase SQL Editor so sub-sections can start from Mock Test 01.",
      };
    }
    return { success: false, message: "This series number or slug is already taken. Refresh and try again." };
  }
  if (error) return { success: false, message: error.message };
  revalidatePath("/admin/mock-tests");
  return { success: true, message: `${title} was created as a draft.` };
}
