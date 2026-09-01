"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CATALOG_TAG } from "@/lib/catalog-data";
import { buildMockTestTitle } from "@/lib/exam-catalog";
import { readMockTestAccess } from "@/lib/mock-test-access";
import { PUBLIC_SLUG_PATTERN } from "@/lib/public-urls";
import { createClient } from "@/lib/supabase/server";
import type { MockTestScope, MockTestStatus } from "@/types/mock-test";

export type UpdateMockTestState = { success: boolean; message: string };

export async function updateMockTest(mockTestId: string, _previous: UpdateMockTestState, formData: FormData): Promise<UpdateMockTestState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be logged in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, message: "You are not authorized to update mock tests." };
  const { data: current } = await supabase.from("mock_tests").select("status, series_number, slug, target_question_count, paper_id, subject_id, test_scope, duration_minutes").eq("id", mockTestId).maybeSingle();
  if (!current) return { success: false, message: "Mock test not found." };
  if (current.status !== "draft") return { success: false, message: "Only draft Mock Tests can be edited. Archive a published test, then restore it as a draft before changing it." };

  const paperId = String(formData.get("paper_id") ?? "").trim();
  const scope = String(formData.get("test_scope") ?? "paper") as MockTestScope;
  const subjectId = String(formData.get("subject_id") ?? "").trim() || null;
  const duration = Number(formData.get("duration_minutes") ?? 0);
  const targetQuestionCount = Number(formData.get("target_question_count") ?? 0);
  const status = String(formData.get("status") ?? "draft") as MockTestStatus;
  const slug = String(formData.get("slug") ?? current.slug).trim().toLowerCase();
  const pricing = readMockTestAccess(formData);
  if (!paperId || !Number.isInteger(duration) || duration <= 0) return { success: false, message: "Choose a paper and enter a valid duration." };
  if (!Number.isInteger(targetQuestionCount) || targetQuestionCount < 1 || targetQuestionCount > 500) return { success: false, message: "Enter a target between 1 and 500 Questions." };
  if ((scope !== "paper" && scope !== "subject") || (scope === "subject" && !subjectId) || status !== "draft") return { success: false, message: "Check the mock type and draft status." };
  if (!PUBLIC_SLUG_PATTERN.test(slug) || ["attempt", "subject", "specialization", "opengraph-image"].includes(slug)) return { success: false, message: "Enter a URL slug using lowercase letters, numbers and single hyphens." };
  if (pricing.error) return { success: false, message: pricing.error };
  // Some older paper-wise mock tests retained a subject_id even though the
  // subject is not part of their test structure. Treat that legacy value as
  // unused so saving a description or slug does not look like a protected
  // structural change after students have attempted the test.
  const currentSubjectId = current.test_scope === "subject" ? current.subject_id : null;
  const submittedSubjectId = scope === "subject" ? subjectId : null;
  const structureChanged =
    paperId !== current.paper_id ||
    scope !== current.test_scope ||
    submittedSubjectId !== currentSubjectId;
  const resultAffectingChange =
    structureChanged ||
    duration !== current.duration_minutes ||
    targetQuestionCount !== current.target_question_count ||
    status !== current.status;
  if (resultAffectingChange) {
    const { count: attemptCount } = await supabase.from("test_attempts").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTestId);
    if ((attemptCount ?? 0) > 0) return { success: false, message: "This Mock Test has student attempts and is locked to protect their results. You can still update its description, instructions and URL slug without changing Paper, Subject, duration or target Questions." };
  }
  if (structureChanged) {
    const { count: assignmentCount } = await supabase.from("mock_test_questions").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTestId);
    if ((assignmentCount ?? 0) > 0) return { success: false, message: "Remove all assigned Questions before changing this Mock Test's Paper or Subject." };
  }

  const paperResult = await supabase.from("papers").select("id, exam_group_id, specialization_id, name, display_order").eq("id", paperId).maybeSingle();
  const paper = paperResult.data;
  if (!paper) return { success: false, message: "The selected paper no longer exists." };
  const [groupResult, subjectResult] = await Promise.all([
    supabase.from("exam_groups").select("id, exam_id, name").eq("id", paper.exam_group_id).maybeSingle(),
    subjectId ? supabase.from("subjects").select("id, paper_id, name").eq("id", subjectId).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  const group = groupResult.data;
  const subject = subjectResult.data;
  if (!group || (scope === "subject" && (!subject || subject.paper_id !== paper.id))) return { success: false, message: "The selected subject must belong to the selected paper." };
  const categoryResult = await supabase.from("exams").select("id, state_id").eq("id", group.exam_id).maybeSingle();
  const stateResult = categoryResult.data ? await supabase.from("exam_states").select("id, code").eq("id", categoryResult.data.state_id).maybeSingle() : { data: null };
  if (!categoryResult.data || !stateResult.data) return { success: false, message: "The exam location is incomplete. Fix it in Exam Structure first." };
  const seriesNumber = Number(current.series_number ?? 1);
  const { data: specialization } = paper.specialization_id
    ? await supabase.from("exam_specializations").select("name").eq("id", paper.specialization_id).maybeSingle()
    : { data: null };
  const title = buildMockTestTitle({ stateCode: stateResult.data.code, examName: group.name, paperName: specialization?.name ?? paper.name, subjectName: subject?.name, seriesNumber });
  const { error } = await supabase.from("mock_tests").update({
    paper_id: paperId,
    test_scope: scope,
    subject_id: submittedSubjectId,
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
  revalidatePath("/admin/mock-tests");
  revalidatePath(`/admin/mock-tests/${mockTestId}/edit`);
  revalidatePath("/mock-tests");
  revalidatePath(`/mock-tests/${mockTestId}`);
  revalidatePath("/");
  revalidateTag(PUBLIC_CATALOG_TAG, "max");
  return { success: true, message: `${title} was updated.` };
}
