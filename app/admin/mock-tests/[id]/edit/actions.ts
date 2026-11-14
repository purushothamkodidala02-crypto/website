"use server";

import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { PUBLIC_CATALOG_TAG, safeRevalidateCatalogTag } from "@/lib/catalog-data";
import { buildMockTestTitle } from "@/lib/exam-catalog";
import { readMockTestAccess } from "@/lib/mock-test-access";
import { createClient } from "@/lib/supabase/server";
import type { MockTestScope } from "@/types/mock-test";

export type UpdateMockTestState = { success: boolean; message: string };

export async function updateMockTest(mockTestId: string, _previous: UpdateMockTestState, formData: FormData): Promise<UpdateMockTestState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "You must be logged in." };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return { success: false, message: "You are not authorized to update mock tests." };
    const { data: current } = await supabase.from("mock_tests").select("status, series_number, slug, target_question_count, paper_id, subject_id, subject_section_id, test_scope, duration_minutes").eq("id", mockTestId).maybeSingle();
    if (!current) return { success: false, message: "Mock test not found." };
    const isPublished = current.status !== "draft";

    const paperId = isPublished ? current.paper_id : String(formData.get("paper_id") ?? "").trim();
    const scope = isPublished ? current.test_scope : (String(formData.get("test_scope") ?? "paper") as MockTestScope);
    const subjectId = isPublished ? current.subject_id : (String(formData.get("subject_id") ?? "").trim() || null);
    // Sub-section (month/topic) can be updated even when published so tests can be organized into months
    const subjectSectionId = scope === "subject" ? (String(formData.get("subject_section_id") ?? "").trim() || null) : null;
    const duration = isPublished ? current.duration_minutes : Number(formData.get("duration_minutes") ?? 0);
    const targetQuestionCount = isPublished ? current.target_question_count : Number(formData.get("target_question_count") ?? 0);
    const status = current.status;
    const slug = String(formData.get("slug") ?? current.slug).trim().toLowerCase();
    const pricing = readMockTestAccess(formData);

    const currentSubjectId = current.test_scope === "subject" ? current.subject_id : null;
    const submittedSubjectId = scope === "subject" ? subjectId : null;
    const structureChanged =
      paperId !== current.paper_id ||
      scope !== current.test_scope ||
      submittedSubjectId !== currentSubjectId;
    const resultAffectingChange =
      structureChanged ||
      duration !== current.duration_minutes ||
      targetQuestionCount !== current.target_question_count;

    if (isPublished && resultAffectingChange) {
      return {
        success: false,
        message: "This mock test is published. You can update its description, instructions, URL slug, access settings, and sub-section, but its Paper, Subject, Duration, and Target Questions are locked to protect test integrity.",
      };
    }
    if (structureChanged) {
      const { count: assignmentCount } = await supabase.from("mock_test_questions").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTestId);
      if ((assignmentCount ?? 0) > 0) return { success: false, message: "Remove all assigned Questions before changing this Mock Test's Paper or Subject." };
    }

    const paperResult = await supabase.from("papers").select("id, exam_group_id, specialization_id, name, display_order").eq("id", paperId).maybeSingle();
    const paper = paperResult.data;
    if (!paper) return { success: false, message: "The selected paper no longer exists." };
    const [groupResult, subjectResult, sectionResult] = await Promise.all([
      supabase.from("exam_groups").select("id, exam_id, name").eq("id", paper.exam_group_id).maybeSingle(),
      subjectId ? supabase.from("subjects").select("id, paper_id, name").eq("id", subjectId).maybeSingle() : Promise.resolve({ data: null, error: null }),
      subjectSectionId ? supabase.from("subject_sections").select("id, subject_id, name").eq("id", subjectSectionId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    const group = groupResult.data;
    const subject = subjectResult.data;
    const section = sectionResult.data;
    if (!group || (scope === "subject" && (!subject || subject.paper_id !== paper.id)) || (scope === "subject" && subjectSectionId && (!section || section.subject_id !== subjectId))) {
      return { success: false, message: "The selected subject and sub-section must belong to the selected paper." };
    }
    const categoryResult = await supabase.from("exams").select("id, state_id").eq("id", group.exam_id).maybeSingle();
    const stateResult = categoryResult.data ? await supabase.from("exam_states").select("id, code").eq("id", categoryResult.data.state_id).maybeSingle() : { data: null };
    if (!categoryResult.data || !stateResult.data) return { success: false, message: "The exam location is incomplete. Fix it in Exam Structure first." };
    const requestedSeries = formData.get("series_number");
    const parsedSeries = requestedSeries ? Number(requestedSeries) : NaN;
    const seriesNumber = Number.isInteger(parsedSeries) && parsedSeries > 0
      ? parsedSeries
      : Number(current.series_number ?? 1);

    if (seriesNumber !== current.series_number) {
      let checkQuery = supabase
        .from("mock_tests")
        .select("id")
        .eq("paper_id", paperId)
        .eq("test_scope", scope)
        .eq("series_number", seriesNumber)
        .neq("id", mockTestId)
        .is("superseded_by_mock_test_id", null);

      if (scope === "subject") {
        checkQuery = checkQuery.eq("subject_id", submittedSubjectId);
        if (subjectSectionId) {
          checkQuery = checkQuery.eq("subject_section_id", subjectSectionId);
        } else {
          checkQuery = checkQuery.is("subject_section_id", null);
        }
      } else {
        checkQuery = checkQuery.is("subject_id", null);
      }
      const { data: conflict } = await checkQuery.maybeSingle();
      if (conflict) {
        return {
          success: false,
          message: `Mock Test ${String(seriesNumber).padStart(2, "0")} already exists in this series. Please choose an unused number.`,
        };
      }
    }

    const { data: specialization } = paper.specialization_id
      ? await supabase.from("exam_specializations").select("name").eq("id", paper.specialization_id).maybeSingle()
      : { data: null };
    const title = buildMockTestTitle({ stateCode: stateResult.data.code, examName: group.name, paperName: specialization?.name ?? paper.name, subjectName: subject?.name, sectionName: section?.name, seriesNumber });
    const { error } = await supabase.from("mock_tests").update({
      paper_id: paperId,
      test_scope: scope,
      subject_id: submittedSubjectId,
      subject_section_id: scope === "subject" && submittedSubjectId ? subjectSectionId : null,
      series_number: seriesNumber,
      title,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      instructions: String(formData.get("instructions") ?? "").trim() || null,
      duration_minutes: duration,
      target_question_count: targetQuestionCount,
      display_order: seriesNumber,
      status,
      published_at: null,
      access_type: pricing.accessType,
      price_inr: pricing.priceInr,
    }).eq("id", mockTestId);
    if (error?.code === "23505") return { success: false, message: "That paper already has this mock-test number." };
    if (error) return { success: false, message: error.message };

    try {
      revalidatePath("/admin/mock-tests");
      revalidatePath(`/admin/mock-tests/${mockTestId}/edit`);
      revalidatePath("/mock-tests");
      revalidatePath(`/mock-tests/${mockTestId}`);
      revalidatePath("/");
    } catch (pathErr) {
      console.warn("revalidatePath error in updateMockTest:", pathErr);
    }
    safeRevalidateCatalogTag();

    return { success: true, message: `${title} was updated.` };
  } catch (err) {
    console.error("Unexpected error in updateMockTest:", err);
    return { success: false, message: err instanceof Error ? err.message : "Failed to update mock test." };
  }
}
